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
    const { expect } = await import('vitest');
    await expect.element(canvasElement).toMatchScreenshot();
  },
};

export default preview;