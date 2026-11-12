import { test } from '@playwright/test'
import { setVisualTheme, shot } from './helpers'

test('sign-in light smoke', async ({ page }) => {
  await setVisualTheme(page, 'light')
  await page.goto('/sign-in')
  await shot(page, 'smoke-sign-in-light')
})
