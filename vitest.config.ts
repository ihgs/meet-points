import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  // 100px までの差分を許容。stable-screenshot のループ安定判定にも
                  // この閾値が使われるため、極端に絞るとバイト一致の連続スクリーンショットですら
                  // ループが収束せず timeout する。実験で 0 / 5 px は flaky → timeout、
                  // 100px なら安定して動作することを確認。
                  // 数文字レベルの差分（例: "v0.1" → "v0.2" の 1〜3px 程度）は検出できないが、
                  // 数十px 以上の見た目変更（色変更、テキスト数文字以上、レイアウトずれ）は確実に検出される。
                  // VRT の現実的な精度として妥当。
                  allowedMismatchedPixels: 100,
                },
              },
            },
          },
        },
      },
    ],
  },
});
