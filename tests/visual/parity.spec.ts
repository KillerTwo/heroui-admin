import { expect, test } from '@playwright/test'
import {
  prepareVisualPage,
  setVisualTheme,
  shot,
  type VisualTheme,
} from './helpers'

const themes: VisualTheme[] = ['light', 'dark']

const routes: { name: string; path: string }[] = [
  { name: 'sign-in', path: '/sign-in' },
  { name: 'dashboard', path: '/' },
  { name: 'tasks', path: '/tasks' },
  { name: 'users', path: '/users' },
  { name: 'settings', path: '/settings' },
]

for (const theme of themes) {
  test.describe(`parity ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await setVisualTheme(page, theme)
    })

    for (const route of routes) {
      test(`${route.name}`, async ({ page }) => {
        await page.goto(route.path)
        await shot(page, `${route.name}-${theme}`)
      })
    }

    test('dialog-open', async ({ page }) => {
      await page.goto('/tasks')
      await prepareVisualPage(page)
      const trigger = page
        .getByRole('button')
        .filter({ hasText: /create|add|new|创建|新增/i })
        .first()
      await trigger.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await shot(page, `tasks-dialog-${theme}`)
    })

    test('dropdown-open', async ({ page }) => {
      await page.goto('/tasks')
      await prepareVisualPage(page)
      const menuBtn = page.locator('[data-testid="visual-row-actions"]').first()
      if (await menuBtn.count()) {
        await menuBtn.click()
      } else {
        await page
          .getByRole('button', { name: /open menu|actions|更多/i })
          .first()
          .click()
      }
      await page.waitForTimeout(100)
      await shot(page, `tasks-dropdown-${theme}`)
    })
  })
}
