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
                  // 数文字レベルの変更（v0.1 → v0.2 の "1"→"2" など）も検出するため
                  // 許容pixel数を 5 まで絞る。per-pixel threshold は default 0.1 を使う
                  // （0.05 まで下げると stable-screenshot のループ安定判定でも flaky になり、
                  // 同一バイトの screenshot ですらループが抜けず timeout する事象が発生した）。
                  // ヘッドレス chromium 同士のレンダリング誤差は通常 0px 想定。
                  allowedMismatchedPixels: 5,
                },
              },
            },
          },
        },
      },
    ],
  },
});
