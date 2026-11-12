import * as React from 'react'
import { Dropdown, Header, Separator } from '@heroui/react'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'
import {
  getTextValue,
  markPassthrough,
  toPlacement,
  type OverlayAlign,
  type OverlaySide,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { PressTrigger } from '@/components/ui/overlay-trigger'

/*
 * Hero's dropdown / menu-item CSS lives in a lower layer than utilities, so the
 * shadcn classes below win. Two details worth knowing:
 *  - a plain `bg-transparent` (no variant) neutralises Hero's media-query hover
 *    background; React Aria moves focus on hover, so `data-[focused=true]`
 *    drives the highlight (what Radix did with `focus:`).
 *  - `transform-none` cancels Hero's pressed scale.
 */

const itemBase =
  "relative flex min-h-0 w-full cursor-default items-center justify-start gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden transform-none select-none data-[focused=true]:bg-accent data-[focused=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[pressed=true]:transform-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Radix API leftover: React Aria menus manage modality themselves. */
  modal?: boolean
  children?: React.ReactNode
}) {
  return (
    <Dropdown
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </Dropdown>
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof PressTrigger>) {
  return <PressTrigger data-slot='dropdown-menu-trigger' {...props} />
}
markPassthrough(DropdownMenuTrigger)

function MenuPopover({
  className,
  menuClassName,
  side,
  align,
  sideOffset,
  children,
  ...props
}: {
  className?: string
  menuClassName?: string
  side: OverlaySide
  align: OverlayAlign
  sideOffset: number
  children?: React.ReactNode
}) {
  return (
    <Dropdown.Popover
      placement={toPlacement(side, align)}
      offset={sideOffset}
      className={className}
      {...(props as object)}
    >
      <Dropdown.Menu
        className={cn(
          'flex w-full flex-col gap-0 overflow-visible p-0 outline-hidden',
          menuClassName
        )}
      >
        {children}
      </Dropdown.Menu>
    </Dropdown.Popover>
  )
}

function DropdownMenuContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  // Radix API leftover (keeps the content mounted while closed).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forceMount,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  side?: OverlaySide
  align?: OverlayAlign
  sideOffset?: number
  forceMount?: boolean
}) {
  return (
    <MenuPopover
      data-slot='dropdown-menu-content'
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
      {...(props as object)}
    >
      {children}
    </MenuPopover>
  )
}

/** Unlabelled group: a React Aria menu section. */
function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof Dropdown.Section>) {
  return <Dropdown.Section data-slot='dropdown-menu-group' {...props} />
}

type ItemProps = {
  className?: string
  inset?: boolean
  variant?: 'default' | 'destructive'
  disabled?: boolean
  /** Navigates (client-side via React Aria's RouterProvider) instead of acting. */
  href?: string
  /** Radix names; both map to React Aria's `onAction`. */
  onSelect?: () => void
  onClick?: () => void
  children?: React.ReactNode
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  onSelect,
  onClick,
  children,
  ...props
}: ItemProps & { textValue?: string }) {
  return (
    <Dropdown.Item
      data-slot='dropdown-menu-item'
      data-inset={inset || undefined}
      data-variant={variant}
      isDisabled={disabled}
      textValue={props.textValue ?? getTextValue(children)}
      onAction={
        onSelect || onClick
          ? () => {
              onSelect?.()
              onClick?.()
            }
          : undefined
      }
      className={cn(
        itemBase,
        "data-[inset=true]:ps-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[focused=true]:bg-destructive/10 data-[variant=destructive]:data-[focused=true]:text-destructive dark:data-[variant=destructive]:data-[focused=true]:bg-destructive/20 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...(props as object)}
    >
      {children}
    </Dropdown.Item>
  )
}

/*
 * Radix checkbox / radio items own their state. In React Aria selection lives
 * on the menu (or a section), so each checkbox item is its own multi-select
 * section and radio items share one single-select section.
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  textValue?: string
}) {
  const id = React.useId()
  return (
    <Dropdown.Section
      data-slot='dropdown-menu-checkbox-section'
      selectionMode='multiple'
      selectedKeys={checked ? [id] : []}
      onSelectionChange={(keys) => {
        onCheckedChange?.(keys === 'all' || keys.has(id))
      }}
    >
      <Dropdown.Item
        id={id}
        data-slot='dropdown-menu-checkbox-item'
        isDisabled={disabled}
        textValue={props.textValue ?? getTextValue(children)}
        className={cn(itemBase, 'ps-8 pe-2', className)}
      >
        {({ isSelected }) => (
          <>
            <span className='pointer-events-none absolute inset-s-2 flex size-3.5 items-center justify-center'>
              {isSelected && <CheckIcon className='size-4' />}
            </span>
            {children}
          </>
        )}
      </Dropdown.Item>
    </Dropdown.Section>
  )
}

function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}) {
  return (
    <Dropdown.Section
      data-slot='dropdown-menu-radio-group'
      selectionMode='single'
      selectedKeys={value === undefined ? undefined : [value]}
      onSelectionChange={(keys) => {
        if (keys === 'all') return
        const [first] = keys
        if (first !== undefined) onValueChange?.(String(first))
      }}
      {...(props as object)}
    >
      {children}
    </Dropdown.Section>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  value,
  disabled,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  value: string
  disabled?: boolean
  textValue?: string
}) {
  return (
    <Dropdown.Item
      id={value}
      data-slot='dropdown-menu-radio-item'
      isDisabled={disabled}
      textValue={props.textValue ?? getTextValue(children)}
      className={cn(itemBase, 'ps-8 pe-2', className)}
    >
      {({ isSelected }) => (
        <>
          <span className='pointer-events-none absolute inset-s-2 flex size-3.5 items-center justify-center'>
            {isSelected && <CircleIcon className='size-2 fill-current' />}
          </span>
          {children}
        </>
      )}
    </Dropdown.Item>
  )
}

/** A label is a header-only section (collections accept no loose elements). */
function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & { inset?: boolean }) {
  return (
    <Dropdown.Section data-slot='dropdown-menu-label-section'>
      <Header
        data-slot='dropdown-menu-label'
        data-inset={inset || undefined}
        className={cn(
          'w-full px-2 py-1.5 text-sm font-medium data-[inset=true]:ps-8',
          className
        )}
        {...(props as object)}
      >
        {children}
      </Header>
    </Dropdown.Section>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-1 my-1 h-px w-[calc(100%+0.5rem)] bg-border', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn(
        'ms-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof Dropdown.SubmenuTrigger>) {
  return <Dropdown.SubmenuTrigger data-slot='dropdown-menu-sub' {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  disabled,
  ...props
}: {
  className?: string
  inset?: boolean
  disabled?: boolean
  children?: React.ReactNode
  textValue?: string
}) {
  return (
    <Dropdown.Item
      data-slot='dropdown-menu-sub-trigger'
      data-inset={inset || undefined}
      isDisabled={disabled}
      textValue={props.textValue ?? getTextValue(children)}
      className={cn(
        itemBase,
        'data-[inset=true]:ps-8 data-[open=true]:bg-accent data-[open=true]:text-accent-foreground',
        className
      )}
    >
      {children}
      <ChevronRightIcon className='ms-auto size-4' />
    </Dropdown.Item>
  )
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'>) {
  return (
    <MenuPopover
      data-slot='dropdown-menu-sub-content'
      side='right'
      align='start'
      sideOffset={0}
      className={cn(
        'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
        className
      )}
      {...(props as object)}
    >
      {children}
    </MenuPopover>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
