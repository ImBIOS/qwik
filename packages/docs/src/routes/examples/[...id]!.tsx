import { component$, Host, useStyles$, useWatch$, useStore } from '@builder.io/qwik';
import { Repl } from '../../repl/repl';
import styles from './examples.css?inline';
import { Header } from '../../components/header/header';
import exampleSections, { ExampleApp } from '@examples-data';
import type { ReplAppInput } from '../../repl/types';
import { DocumentHead, useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  useStyles$(styles);

  const { params } = useLocation();

  const store = useStore<ExamplesStore>(() => {
    const app = getExampleApp(params.id);

    const initStore: ExamplesStore = {
      appId: params.id,
      buildId: 0,
      buildMode: 'development',
      entryStrategy: 'hook',
      files: app?.inputs || [],
      version: '',
      activePanel: 'Examples',
    };
    return initStore;
  });

  useWatch$(({ track }) => {
    const appId = track(store, 'appId');
    const app = getExampleApp(appId);
    store.files = app?.inputs || [];
    if (typeof document !== 'undefined') {
      document.title = `${app?.title} - Qwik`;
    }
  });

  return (
    <Host class="examples full-width fixed-header">
      <Header />

      <div
        class={{
          'examples-menu-container': true,
          'examples-panel-input': store.activePanel === 'Input',
          'examples-panel-output': store.activePanel === 'Output',
          'examples-panel-console': store.activePanel === 'Console',
        }}
      >
        <div class="examples-menu">
          {exampleSections.map((s) => (
            <div key={s.id} class="examples-menu-section">
              <h2>{s.title}</h2>

              {s.apps.map((app) => (
                <a
                  key={app.id}
                  href={`/examples/${app.id}`}
                  preventDefault:click
                  onClick$={() => {
                    store.appId = app.id;
                    store.activePanel = 'Input';
                    history.replaceState({}, '', `/examples/${app.id}`);
                  }}
                  class={{
                    'example-button': true,
                    selected: store.appId === app.id,
                  }}
                >
                  <div class="example-button-icon">{app.icon}</div>
                  <div class="example-button-content">
                    <h3>{app.title}</h3>
                    <p>{app.description}</p>
                  </div>
                </a>
              ))}
            </div>
          ))}
          <a
            href="https://github.com/BuilderIO/qwik/tree/main/packages/docs/src/pages/examples"
            class="example-button-new"
            target="_blank"
          >
            👏 Add new examples
          </a>
        </div>

        <main class="examples-repl">
          <Repl
            input={store}
            enableSsrOutput={false}
            enableClientOutput={false}
            enableHtmlOutput={false}
            enableCopyToPlayground={true}
            enableDownload={true}
            enableInputDelete={false}
          />
        </main>
      </div>
      <div class="panel-toggle">
        {PANELS.map((p) => (
          <button
            key={p}
            onClick$={() => {
              store.activePanel = p;
            }}
            type="button"
            preventDefault:click
            class={{ active: store.activePanel === p }}
          >
            {p}
          </button>
        ))}
      </div>
    </Host>
  );
});

export const getExampleApp = (id: string): ExampleApp | undefined => {
  for (const exampleSection of exampleSections) {
    for (const app of exampleSection.apps) {
      if (app.id === id) {
        return JSON.parse(JSON.stringify(app));
      }
    }
  }
};

export const head: DocumentHead = ({ params }) => {
  const app = getExampleApp(params.id);
  return {
    title: app?.title || 'Example',
  };
};

export const PANELS: ActivePanel[] = ['Examples', 'Input', 'Output', 'Console'];

interface ExamplesStore extends ReplAppInput {
  appId: string;
  activePanel: ActivePanel;
}

type ActivePanel = 'Examples' | 'Input' | 'Output' | 'Console';
