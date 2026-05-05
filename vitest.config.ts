import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// label を渡すとスクリーンショット/ diff のパスに `label` セグメントを差し込む。
// label なしの場合は従来パス（既存スクリーンショットと一致）を維持する。
const buildToMatchScreenshot = (label?: string) => ({
  comparatorName: 'pixelmatch' as const,
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
  resolveScreenshotPath: ({
    root,
    testFileDirectory,
    screenshotDirectory,
    testFileName,
    arg,
    browserName,
    platform,
    ext,
  }: {
    root: string;
    testFileDirectory: string;
    screenshotDirectory: string;
    testFileName: string;
    arg: string;
    browserName: string;
    platform: NodeJS.Platform;
    ext: string;
  }) =>
    path.join(
      root,
      testFileDirectory,
      screenshotDirectory,
      ...(label ? [label] : []),
      platform,
      testFileName,
      `${arg}-${browserName}${ext}`,
    ),
  resolveDiffPath: ({
    root,
    attachmentsDir,
    testFileDirectory,
    testFileName,
    arg,
    browserName,
    platform,
    ext,
  }: {
    root: string;
    attachmentsDir: string;
    testFileDirectory: string;
    testFileName: string;
    arg: string;
    browserName: string;
    platform: NodeJS.Platform;
    ext: string;
  }) =>
    path.join(
      root,
      attachmentsDir,
      testFileDirectory,
      ...(label ? [label] : []),
      platform,
      testFileName,
      `${arg}-${browserName}${ext}`,
    ),
});

const storybookProject = (
  name: string,
  options: { isMobile: boolean; screenshotLabel?: string },
) => ({
  extends: true as const,
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    storybookTest({ configDir: path.join(dirname, '.storybook') }),
  ],
  define: {
    // preview.ts の afterEach から viewport 切替を分岐させるためのフラグ。
    // Vite の define で literal 置換されるので、preview.ts 側では bare identifier として参照する。
    __VRT_MOBILE__: JSON.stringify(options.isMobile),
  },
  test: {
    name,
    // VRT の stable-screenshot loop + matcher 内部 timeout を吸収するため
    // default の testTimeout (5_000ms) より十分大きく取る
    testTimeout: 30_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: 'chromium' as const }],
      expect: {
        toMatchScreenshot: buildToMatchScreenshot(options.screenshotLabel),
      },
    },
  },
});

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      storybookProject('storybook', { isMobile: false }),
      storybookProject('storybook-mobile', {
        isMobile: true,
        // 既存（デスクトップ）の `__screenshots__/<platform>/...` と衝突させないため
        // モバイルは `__screenshots__/mobile/<platform>/...` 配下に保存する。
        screenshotLabel: 'mobile',
      }),
    ],
  },
});
