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
          // VRT の stable-screenshot loop + matcher 内部 timeout を吸収するため
          // default の testTimeout (5_000ms) より十分大きく取る
          testTimeout: 30_000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  // 100px までの差分を許容。
                  // 既知の制約: vitest の stable-screenshot ループは同じ comparatorOptions で
                  // 連続 screenshot の安定性も判定するため、極端に絞ると（5px 以下など）バイト一致の
                  // screenshot ですら不安定と判定され、ループが収束せずテストが timeout する。
                  // そのため数pixel スケールの細かい差分（例: "v0.1" → "v0.2" の文字差）は
                  // 検出できないが、数十px 以上の見た目変更（色変更、文字の追加・削除、
                  // レイアウトずれ）は確実に検出される実用域として 100 を採用。
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
