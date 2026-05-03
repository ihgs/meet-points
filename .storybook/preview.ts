import type { Preview } from '@storybook/nextjs-vite'
import '../app/globals.css';

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
    }
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