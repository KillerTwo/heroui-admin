import * as React from 'react'
import { Radio as HeroRadio, RadioGroup as HeroRadioGroup } from '@heroui/react'
import { CircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type RadioGroupProps = Omit<
  React.ComponentProps<typeof HeroRadioGroup>,
  'className' | 'isDisabled' | 'isRequired' | 'onChange'
> & {
  className?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
}

function RadioGroup({
  className,
  onValueChange,
  disabled,
  required,
  ...props
}: RadioGroupProps) {
  return (
    <HeroRadioGroup
      data-slot='radio-group'
      onChange={onValueChange}
      isDisabled={disabled}
      isRequired={required}
      // React Aria warns when a group has no accessible name; Radix never
      // required one. Callers should pass `aria-label(ledby)`; fall back to a
      // generic name so existing call sites stay silent.
      aria-label={props['aria-labelledby'] ? undefined : 'Radio group'}
      // Hero adds `mt-4` to each radio of a vertical group; legacy spaces them
      // with the grid `gap`.
      className={cn('grid gap-3 [&_[data-slot=radio]]:mt-0', className)}
      {...props}
    />
  )
}

type RadioGroupItemProps = Omit<
  React.ComponentProps<typeof HeroRadio>,
  'children' | 'className' | 'isDisabled' | 'value'
> & {
  className?: string
  value: string
  disabled?: boolean
}

function RadioGroupItem({
  className,
  disabled,
  value,
  ...props
}: RadioGroupItemProps) {
  return (
    <HeroRadio
      data-slot='radio-group-item'
      value={value}
      isDisabled={disabled}
      className={cn('inline-flex w-fit shrink-0 outline-none', className)}
      {...props}
    >
      <HeroRadio.Content className='group/radio gap-0'>
        <HeroRadio.Control
          className={cn(
            // `data-[selected]` fills are Hero defaults (brand `--accent`);
            // pin the legacy outline look in every state.
            'aspect-square size-4 shrink-0 rounded-full border border-input bg-transparent text-primary shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
            'group-has-[input:focus-visible]/radio:border-ring group-has-[input:focus-visible]/radio:ring-[3px] group-has-[input:focus-visible]/radio:ring-ring/50',
            'group-data-[invalid=true]/radio:border-destructive group-data-[invalid=true]/radio:ring-destructive/20 dark:group-data-[invalid=true]/radio:ring-destructive/40',
            'group-data-[selected=true]/radio:border-input group-data-[selected=true]/radio:bg-transparent dark:group-data-[selected=true]/radio:bg-input/30'
          )}
        >
          <HeroRadio.Indicator>
            {({ isSelected }) =>
              isSelected ? <CircleIcon className='size-2 fill-primary' /> : null
            }
          </HeroRadio.Indicator>
        </HeroRadio.Control>
      </HeroRadio.Content>
    </HeroRadio>
  )
}

export { RadioGroup, RadioGroupItem }
