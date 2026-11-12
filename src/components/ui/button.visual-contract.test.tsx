import '@/styles/index.css'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from './button'

describe('Button visual contract', () => {
  test('default size is 36px tall (h-9)', async () => {
    const screen = await render(<Button>Save</Button>)
    const el = screen.getByRole('button', { name: 'Save' })
    const box = el.element().getBoundingClientRect()
    expect(box.height).toBe(36)
  })

  test('sm / lg / icon sizes keep legacy heights', async () => {
    const screen = await render(
      <div>
        <Button size='sm'>Small</Button>
        <Button size='lg'>Large</Button>
        <Button size='icon' aria-label='Icon'>
          x
        </Button>
      </div>
    )
    const h = (name: string) =>
      screen.getByRole('button', { name }).element().getBoundingClientRect()
    expect(h('Small').height).toBe(32)
    expect(h('Large').height).toBe(40)
    expect(h('Icon').height).toBe(36)
    expect(h('Icon').width).toBe(36)
  })
})
