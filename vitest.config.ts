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
                  // 比率指定だと 960x720 で 0.001 = 約700px と緩く、数文字の変更を取りこぼす。
                  // 絶対値 10px + per-pixel threshold を pixelmatch デフォルト 0.1 から 0.05 に絞り、
                  // 数文字レベルの変更（v0.1 → v0.2 の "1"→"2" など）を確実に検出可能に。
                  // ヘッドレス chromium 同士のレンダリング誤差は通常 0px 想定。
                  // 偽陽性が頻発する場合は段階的に緩める方針。
                  allowedMismatchedPixels: 10,
                  threshold: 0.05,
                },
              },
            },
          },
        },
      },
    ],
  },
});
