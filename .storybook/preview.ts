import type { Preview } from '@storybook/nextjs-vite'
import '../app/globals.css';

// vitest.config.ts の define で literal 置換される VRT 用フラグ。
// - storybook プロジェクト: false に置換
// - storybook-mobile プロジェクト: true に置換
// - storybook dev サーバー（define が効かない実行系）: 識別子未定義のままなので、
//   typeof でガードしてから参照する。
declare const __VRT_MOBILE__: boolean | undefined;
const isMobileVrt =
  typeof __VRT_MOBILE__ !== 'undefined' && __VRT_MOBILE__ === true;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    // storybook-mobile プロジェクトでは Storybook 標準の viewport パラメータで
    // iPhone 14 相当 (390x844) をデフォルトに指定する。
    // addon-vitest が play 直前に page.viewport(...) でこのサイズを iframe に適用するので、
    // 各ストーリーはモバイル幅でレンダリングされてから撮影される。
    ...(isMobileVrt && {
      viewport: {
        defaultViewport: 'iphone14',
        viewports: {
          iphone14: {
            name: 'iPhone 14',
            styles: { width: '390px', height: '844px' },
            type: 'mobile',
          },
        },
      },
    }),
  },
  afterEach: async ({ canvasElement, tags }) => {
    if (!tags?.includes('vrt')) return;
    if (!(globalThis as { __vitest_browser__?: boolean }).__vitest_browser__) return;

    // CSS アニメーション/トランジションを無効化してスクリーンショットを安定化させる。
    // animate-card-in のように fill-mode: both で opacity 0 → 1 のアニメは、
    // 完了前にキャプチャすると要素が見えないままになってしまう。
    // animation:none だけでは fill-mode 由来の opacity:0 が残るので、
    // .animate-card-in に直接 to-state を上書きしている。
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
      .animate-card-in {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
    // スタイル反映を確実にするため、2 フレーム + 短い待ちを挟む
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => setTimeout(r, 50));

    const { expect } = await import('vitest');
    await expect.element(canvasElement).toMatchScreenshot();
  },
};

export default preview;