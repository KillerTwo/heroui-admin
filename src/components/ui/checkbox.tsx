import * as React from 'react'
import { Checkbox as HeroCheckbox } from '@heroui/react'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type CheckboxProps = Omit<
  React.ComponentProps<typeof HeroCheckbox>,
  | 'children'
  | 'className'
  | 'defaultSelected'
  | 'isSelected'
  | 'isIndeterminate'
  | 'isDisabled'
  | 'isRequired'
  | 'isInvalid'
  | 'onChange'
> & {
  className?: string
  /** Radix-compatible controlled state. `'indeterminate'` renders the mixed state. */
  checked?: boolean | 'indeterminate'
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  required?: boolean
}

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps & { 'aria-invalid'?: React.AriaAttributes['aria-invalid'] }) {
  return (
    <HeroCheckbox
      data-slot='checkbox'
      isSelected={checked === undefined ? undefined : checked === true}
      isIndeterminate={checked === 'indeterminate'}
      defaultSelected={defaultChecked}
      onChange={onCheckedChange}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={ariaInvalid === true || ariaInvalid === 'true'}
      className={cn('peer inline-flex w-fit shrink-0 outline-none', className)}
      {...props}
    >
      <HeroCheckbox.Content className='group/checkbox gap-0'>
        <HeroCheckbox.Control
          className={cn(
            // Visual contract of the old shadcn checkbox. `before:hidden`
            // kills Hero's selected-fill pseudo element (it paints with the
            // shadcn `--accent` hover grey).
            'relative size-4 shrink-0 overflow-visible rounded-lg border border-input bg-transparent shadow-xs transition-shadow outline-none before:hidden dark:bg-input/30',
            'group-has-[input:focus-visible]/checkbox:border-ring group-has-[input:focus-visible]/checkbox:ring-[3px] group-has-[input:focus-visible]/checkbox:ring-ring/50',
            'group-data-[invalid=true]/checkbox:border-destructive group-data-[invalid=true]/checkbox:ring-destructive/20 dark:group-data-[invalid=true]/checkbox:ring-destructive/40',
            'group-data-[selected=true]/checkbox:border-primary group-data-[selected=true]/checkbox:bg-primary group-data-[selected=true]/checkbox:text-primary-foreground dark:group-data-[selected=true]/checkbox:bg-primary',
            'group-data-[indeterminate=true]/checkbox:border-primary group-data-[indeterminate=true]/checkbox:bg-primary group-data-[indeterminate=true]/checkbox:text-primary-foreground dark:group-data-[indeterminate=true]/checkbox:bg-primary'
          )}
        >
          <HeroCheckbox.Indicator className='size-3.5 text-current'>
            {({ isSelected, isIndeterminate }) =>
              isSelected || isIndeterminate ? (
                <CheckIcon className='size-3.5' />
              ) : null
            }
          </HeroCheckbox.Indicator>
        </HeroCheckbox.Control>
      </HeroCheckbox.Content>
    </HeroCheckbox>
  )
}

export { Checkbox }
