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

    await userEvent.click(screen.getByRole('button', { name: /May 15th, 2024/ }))
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
