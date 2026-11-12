import '@/styles/index.css'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'

function State() {
  const { state, setOpen } = useSidebar()
  return (
    <>
      <span data-testid='state'>{state}</span>
      <button type='button' onClick={() => setOpen(false)}>
        Collapse
      </button>
    </>
  )
}

describe('Collapsible (no Radix)', () => {
  it('toggles content and merges props through asChild', async () => {
    const screen = await render(
      <Collapsible asChild className='group/collapsible'>
        <section data-testid='root'>
          <CollapsibleTrigger asChild>
            <button type='button'>Toggle</button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <a href='#child'>Child link</a>
          </CollapsibleContent>
        </section>
      </Collapsible>
    )

    const root = screen.getByTestId('root')
    await expect.element(root).toHaveAttribute('data-state', 'closed')
    expect(screen.container.textContent).not.toContain('Child link')

    await screen.getByRole('button', { name: 'Toggle' }).click()
    await expect.element(root).toHaveAttribute('data-state', 'open')
    await expect.element(screen.getByText('Child link')).toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: 'Toggle' }))
      .toHaveAttribute('aria-expanded', 'true')

    await screen.getByRole('button', { name: 'Toggle' }).click()
    await expect.element(root).toHaveAttribute('data-state', 'closed')
    await expect
      .poll(() => screen.container.textContent)
      .not.toContain('Child link')
  })

  it('honours defaultOpen', async () => {
    const screen = await render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible body</CollapsibleContent>
      </Collapsible>
    )
    await expect.element(screen.getByText('Visible body')).toBeVisible()
  })
})

describe('Sidebar (no Radix Slot)', () => {
  it('toggles state, writes the sidebar_state cookie and supports asChild', async () => {
    const screen = await render(
      <SidebarProvider>
        <State />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href='#dash'>Dashboard</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>
    )

    await expect
      .element(screen.getByTestId('state'))
      .toHaveTextContent('expanded')
    await expect
      .element(screen.getByRole('link', { name: 'Dashboard' }))
      .toHaveAttribute('data-sidebar', 'menu-button')

    await screen.getByRole('button', { name: 'Collapse' }).click()
    await expect
      .element(screen.getByTestId('state'))
      .toHaveTextContent('collapsed')
    expect(document.cookie).toContain('sidebar_state=false')
  })
})
