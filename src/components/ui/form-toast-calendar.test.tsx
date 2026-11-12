import { useForm } from 'react-hook-form'
import '@/styles/index.css'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Toaster, toast } from '@/components/ui/sonner'
import { DatePicker } from '@/components/date-picker'

function LabelledInput({ onRef }: { onRef: (el: HTMLInputElement) => void }) {
  const form = useForm({ defaultValues: { name: '' } })
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={(el) => {
                  field.ref(el)
                  if (el) onRef(el)
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}

describe('Form', () => {
  it('wires id/aria to the child and keeps the child ref', async () => {
    const onRef = vi.fn()
    const screen = await render(<LabelledInput onRef={onRef} />)
    const input = screen.getByLabelText('Name')

    await expect.element(input).toBeInTheDocument()
    expect(onRef).toHaveBeenCalled()
    await userEvent.fill(input, 'abc')
    await expect.element(input).toHaveValue('abc')
  })
})

describe('toast adapter', () => {
  afterEach(() => toast.dismiss())

  it('renders error / message / promise toasts through the Hero queue', async () => {
    const screen = await render(<Toaster duration={0} />)

    toast.error('Boom!')
    await expect.element(screen.getByText('Boom!')).toBeInTheDocument()

    toast.message('Title', { description: 'Body text' })
    await expect.element(screen.getByText('Body text')).toBeInTheDocument()

    toast.promise(Promise.resolve(1), {
      loading: 'Working...',
      success: () => 'All done',
      error: 'Failed',
    })
    await expect.element(screen.getByText('All done')).toBeInTheDocument()
  })

  it('styles the description as a full-width block with readable text', async () => {
    const screen = await render(<Toaster duration={0} />)

    toast.message('Title', {
      description: <pre data-testid='payload'>{'x'.repeat(10)}</pre>,
    })
    await expect
      .poll(() => document.querySelector('.toast__description'))
      .not.toBeNull()
    const description = document.querySelector('.toast__description')
    const style = getComputedStyle(description ?? document.body)
    expect(style.display).toBe('block')
    const probe = document.createElement('span')
    probe.className = 'text-muted-foreground'
    document.body.append(probe)
    expect(style.color).toBe(getComputedStyle(probe).color)
    probe.remove()
    await expect.element(screen.getByTestId('payload')).toBeInTheDocument()
  })

  it('applies the Toaster duration to promise toasts and restores it on unmount', async () => {
    const screen = await render(<Toaster duration={150} />)
    toast.promise(Promise.resolve(1), {
      loading: 'Loading...',
      success: 'Short lived',
      error: 'Failed',
    })
    await expect.element(screen.getByText('Short lived')).toBeInTheDocument()
    await expect
      .poll(() => screen.getByText('Short lived').query(), { timeout: 3000 })
      .toBeNull()

    await screen.unmount()
    const id = toast.message('after unmount')
    const queued = toast
      .getQueue()
      .visibleToasts.find((item) => item.key === id)
    expect(queued?.timeout).toBe(5000)
  })
})

describe('Calendar', () => {
  it('selects a day through the Hero-backed day button', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <Calendar
        mode='single'
        defaultMonth={new Date(2024, 4, 1)}
        onSelect={onSelect}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /May 15th, 2024/ })
    )
    expect(onSelect).toHaveBeenCalledOnce()
    expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(15)
  })

  it('navigates months with the previous/next buttons', async () => {
    const screen = await render(
      <Calendar mode='single' defaultMonth={new Date(2024, 4, 1)} />
    )

    await userEvent.click(screen.getByRole('button', { name: /next month/i }))
    await expect.element(screen.getByText('June 2024')).toBeInTheDocument()
  })
})

describe('InputOTP', () => {
  it('renders six slots and accepts typed digits', async () => {
    const onChange = vi.fn()
    const screen = await render(
      <InputOTP maxLength={6} onChange={onChange} aria-label='code'>
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    )

    await userEvent.fill(screen.getByLabelText('code'), '123456')
    expect(onChange).toHaveBeenLastCalledWith('123456')
    await expect.element(screen.getByText('6').first()).toBeInTheDocument()
  })
})

describe('DatePicker', () => {
  it('does not submit an enclosing form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const screen = await render(
      <form onSubmit={onSubmit}>
        <DatePicker selected={undefined} onSelect={() => {}} />
      </form>
    )

    await userEvent.click(screen.getByRole('button', { name: /pick a date/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
