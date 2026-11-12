import * as React from 'react'
import { ListBox, Select as HeroSelect, Separator } from '@heroui/react'
import { CheckIcon } from 'lucide-react'
import {
  getTextValue,
  toPlacement,
  type OverlayAlign,
  type OverlaySide,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'

type SelectBaseProps = {
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  required?: boolean
  name?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  children?: React.ReactNode
  className?: string
}

// Radix uses '' as "no value"; React Aria uses `null`.
const toKey = (value: string | undefined) =>
  value === undefined ? undefined : value === '' ? null : value

function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  className,
  children,
  ...aria
}: SelectBaseProps) {
  return (
    <HeroSelect
      data-slot='select'
      selectedKey={toKey(value)}
      defaultSelectedKey={toKey(defaultValue)}
      onSelectionChange={
        onValueChange
          ? (key) => onValueChange(key == null ? '' : String(key))
          : undefined
      }
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={disabled}
      isRequired={required}
      name={name}
      // RAC renders a wrapper element; Radix had none, so keep it out of layout.
      className={cn('contents', className)}
      {...aria}
    >
      {children}
    </HeroSelect>
  )
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof ListBox.Section>) {
  return <ListBox.Section data-slot='select-group' {...props} />
}

function SelectValue({
  placeholder,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'span'>, 'children'> & {
  placeholder?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <HeroSelect.Value
      data-slot='select-value'
      className={cn(
        // Hero's .select__value is `flex-1 text-start text-base sm:text-sm`
        'flex-1 text-start text-sm',
        className as string
      )}
      {...(props as object)}
    >
      {({ isPlaceholder, defaultChildren }) => {
        if (children !== undefined && children !== null) return children
        return isPlaceholder ? placeholder : defaultChildren
      }}
    </HeroSelect.Value>
  )
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  disabled,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  size?: 'sm' | 'default'
  children?: React.ReactNode
}) {
  return (
    <HeroSelect.Trigger
      data-size={size}
      isDisabled={disabled}
      // Hero's `.select__trigger` (lower layer) is re-skinned with the shadcn
      // trigger classes; Hero's `bg-field` / `shadow-field` / radius yield.
      className={cn(
        "flex min-h-0 w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 pe-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className as string
      )}
      {...(props as object)}
      data-slot='select-trigger'
    >
      {children}
      <HeroSelect.Indicator className='static my-0 size-4 opacity-50 [&_svg]:size-4' />
    </HeroSelect.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  side?: OverlaySide
  align?: OverlayAlign
  sideOffset?: number
  /** Radix API leftover: the popover is always anchored to the trigger. */
  position?: 'popper' | 'item-aligned'
}) {
  return (
    <HeroSelect.Popover
      data-slot='select-content'
      placement={toPlacement(side, align)}
      offset={sideOffset}
      className={cn(
        'z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md',
        className
      )}
      {...(props as object)}
    >
      <ListBox className='w-full min-w-(--trigger-width) scroll-my-1 overflow-visible p-1'>
        {children}
      </ListBox>
    </HeroSelect.Popover>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='select-label'
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  textValue,
  ...props
}: Omit<React.ComponentProps<typeof ListBox.Item>, 'id' | 'children'> & {
  value: string
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <ListBox.Item
      data-slot='select-item'
      id={value}
      isDisabled={disabled}
      textValue={textValue ?? (getTextValue(children) || value)}
      className={cn(
        // Hero's list-box-item (lower layer) re-skinned to the shadcn item.
        "relative flex min-h-0 w-full transform-none cursor-default items-center justify-start gap-2 rounded-sm bg-transparent py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[focused=true]:bg-accent data-[focused=true]:text-accent-foreground data-[hovered=true]:bg-accent data-[hovered=true]:text-accent-foreground data-[pressed=true]:transform-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className as string
      )}
      {...(props as object)}
    >
      {children}
      <ListBox.ItemIndicator className='absolute inset-e-2 flex size-3.5 items-center justify-center text-current'>
        {({ isSelected }) =>
          isSelected ? <CheckIcon className='size-4' /> : null
        }
      </ListBox.ItemIndicator>
    </ListBox.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='select-separator'
      className={cn(
        'pointer-events-none -mx-1 my-1 h-px w-auto bg-border',
        className
      )}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
