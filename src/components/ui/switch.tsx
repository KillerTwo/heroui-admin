import * as React from 'react'
import { Switch as HeroSwitch } from '@heroui/react'
import { cn } from '@/lib/utils'

type SwitchProps = Omit<
  React.ComponentProps<typeof HeroSwitch>,
  | 'children'
  | 'className'
  | 'defaultSelected'
  | 'isSelected'
  | 'isDisabled'
  | 'isReadOnly'
  | 'onChange'
> & {
  className?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <HeroSwitch
      data-slot='switch'
      isSelected={checked}
      defaultSelected={defaultChecked}
      onChange={onCheckedChange}
      isDisabled={disabled}
      className={cn('peer inline-flex w-fit shrink-0 outline-none', className)}
      {...props}
    >
      <HeroSwitch.Content className='group/switch gap-0'>
        <HeroSwitch.Control
          className={cn(
            // Old legacy track: 32 x 18.4px, 1px transparent border.
            'h-[1.15rem] w-8 shrink-0 items-center overflow-visible rounded-full border border-transparent bg-input shadow-xs transition-all outline-none dark:bg-input/80',
            'group-has-[input:focus-visible]/switch:border-ring group-has-[input:focus-visible]/switch:ring-[3px] group-has-[input:focus-visible]/switch:ring-ring/50',
            'group-data-[selected=true]/switch:bg-primary dark:group-data-[selected=true]/switch:bg-primary'
          )}
        >
          <HeroSwitch.Thumb
            className={cn(
              'pointer-events-none start-0 ms-0 block size-4 rounded-full bg-background shadow-none ring-0 transition-transform dark:bg-foreground',
              'group-data-[selected=true]/switch:translate-x-[calc(100%-2px)] group-data-[selected=true]/switch:bg-background rtl:group-data-[selected=true]/switch:-translate-x-[calc(100%-2px)] dark:group-data-[selected=true]/switch:bg-primary-foreground'
            )}
          />
        </HeroSwitch.Control>
      </HeroSwitch.Content>
    </HeroSwitch>
  )
}

export { Switch }
