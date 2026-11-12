import { useForm } from 'react-hook-form'
import '@/styles/index.css'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function RowActions({ onEdit }: { onEdit: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-testid='visual-row-actions' variant='ghost'>
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('overlay triggers (Radix asChild call-site contract)', () => {
  it('opens a dropdown with the mouse and runs onSelect', async () => {
    const onEdit = vi.fn()
    const { getByRole } = await render(<RowActions onEdit={onEdit} />)
    const trigger = getByRole('button', { name: 'Open menu' })

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it.each(['{Enter}', ' ', '{ArrowDown}'])(
    'opens a dropdown from the keyboard (%j)',
    async (key) => {
      const { getByRole } = await render(<RowActions onEdit={vi.fn()} />)
      const trigger = getByRole('button', { name: 'Open menu' })

      await userEvent.tab()
      await expect.element(trigger).toHaveFocus()
      await userEvent.keyboard(key)

      await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect
        .element(getByRole('menuitem', { name: 'Edit' }))
        .toBeInTheDocument()
    }
  )

  it('opens a dialog from a Button asChild trigger with mouse and keyboard', async () => {
    const { getByRole } = await render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Hello</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await userEvent.click(getByRole('button', { name: 'Open dialog' }))
    await expect
      .element(getByRole('heading', { name: 'Hello' }))
      .toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect
      .element(getByRole('heading', { name: 'Hello' }))
      .not.toBeInTheDocument()

    await userEvent.keyboard('{Enter}')
    await expect
      .element(getByRole('heading', { name: 'Hello' }))
      .toBeInTheDocument()
  })

  it('opens a popover from a Button asChild trigger', async () => {
    const { getByRole, getByText } = await render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Pick</Button>
        </PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    )

    const trigger = getByRole('button', { name: 'Pick' })
    await userEvent.click(trigger)
    await expect.element(getByText('Popover body')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect.element(trigger).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens a popover through PopoverTrigger asChild > FormControl > Button', async () => {
    function Field() {
      const form = useForm({ defaultValues: { lang: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name='lang'
            render={() => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button>Language</Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>Language list</PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </Form>
      )
    }
    const { getByRole, getByText } = await render(<Field />)
    const trigger = getByRole('button', { name: 'Language' })

    await userEvent.click(trigger)
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.element(getByText('Language list')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect.element(trigger).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports a tooltip and a dropdown on the same Button (nested asChild)', async () => {
    const { getByRole, getByText } = await render(
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button>Both</Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Tip text</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuItem>One</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    )
    const trigger = getByRole('button', { name: 'Both' })

    await userEvent.tab()
    await expect.element(getByText('Tip text')).toBeInTheDocument()
    await userEvent.click(trigger)
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect
      .element(getByRole('menuitem', { name: 'One' }))
      .toBeInTheDocument()
  })

  it('shows a tooltip for a non-button (div) asChild trigger on hover', async () => {
    const { getByText } = await render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Truncated text</div>
          </TooltipTrigger>
          <TooltipContent>Full text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    await userEvent.hover(getByText('Truncated text'))
    await expect.element(getByText('Full text').first()).toBeInTheDocument()
  })
})
