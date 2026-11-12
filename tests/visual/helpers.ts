import { type Page, expect } from '@playwright/test'

export type VisualTheme = 'light' | 'dark'

export async function setVisualTheme(page: Page, theme: VisualTheme) {
  await page.context().addCookies([
    {
      name: 'vite-ui-theme',
      value: theme,
      domain: '127.0.0.1',
      path: '/',
    },
  ])
}

export async function prepareVisualPage(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  })
  await page.evaluate(() => document.fonts.ready)
}

export async function shot(page: Page, name: string) {
  await prepareVisualPage(page)
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
}
