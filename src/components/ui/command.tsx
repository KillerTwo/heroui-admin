import * as React from 'react'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Local command palette primitives (search input + filterable listbox).
 *
 * Replaces the former third-party command-menu library, which pulled Radix
 * packages in transitively. The shell is the HeroUI-based `Dialog` / `Popover`;
 * this file only adds search state, substring filtering and arrow-key
 * navigation. Items stay in the DOM order they are rendered in.
 */

const ITEM_SELECTOR = '[data-slot=command-item]:not([data-disabled=true])'

type CommandContextValue = {
  search: string
  setSearch: (value: string) => void
  shouldFilter: boolean
  activeId: string | null
  setActiveId: (id: string | null) => void
  visibleCount: number
  registerItem: (id: string) => () => void
  listId: string
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommand(component: string) {
  const ctx = React.use(CommandContext)
  if (!ctx) throw new Error(`${component} must be used within <Command>`)
  return ctx
}

function Command({
  className,
  shouldFilter = true,
  onKeyDown,
  ref,
  ...props
}: React.ComponentProps<'div'> & { shouldFilter?: boolean }) {
  const [search, setSearch] = React.useState('')
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [visible, setVisible] = React.useState<ReadonlySet<string>>(
    () => new Set()
  )
  const listId = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  const registerItem = React.useCallback((id: string) => {
    setVisible((prev) => new Set(prev).add(id))
    return () =>
      setVisible((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
  }, [])

  const getItems = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []
    )

  // Keep a valid highlighted item (first one) after any filter / list change.
  React.useLayoutEffect(() => {
    const items = getItems()
    if (!items.some((el) => el.id === activeId)) {
      setActiveId(items[0]?.id ?? null)
    }
  }, [search, visible, activeId])

  const highlight = (el: HTMLElement | undefined) => {
    if (!el) return
    setActiveId(el.id)
    el.scrollIntoView({ block: 'nearest' })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || e.nativeEvent.isComposing) return
    const items = getItems()
    const index = items.findIndex((el) => el.id === activeId)
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        highlight(items[Math.min(index + 1, items.length - 1)])
        break
      case 'ArrowUp':
        e.preventDefault()
        highlight(items[Math.max(index - 1, 0)])
        break
      case 'Home':
        e.preventDefault()
        highlight(items[0])
        break
      case 'End':
        e.preventDefault()
        highlight(items[items.length - 1])
        break
      case 'Enter':
        if (index >= 0) {
          e.preventDefault()
          items[index].click()
        }
        break
    }
  }

  const value = React.useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch,
      shouldFilter,
      activeId,
      setActiveId,
      visibleCount: visible.size,
      registerItem,
      listId,
    }),
    [search, shouldFilter, activeId, visible, registerItem, listId]
  )

  return (
    <CommandContext value={value}>
      <div
        data-slot='command'
        ref={(node) => {
          rootRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </CommandContext>
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn('overflow-hidden p-0', className)}
        showCloseButton={showCloseButton}
      >
        <Command className='**:data-[slot=command-group]:px-2 **:data-[slot=command-group-heading]:px-2 **:data-[slot=command-group-heading]:font-medium **:data-[slot=command-group-heading]:text-muted-foreground **:data-[slot=command-input]:h-12 **:data-[slot=command-input-wrapper]:h-12 **:data-[slot=command-item]:px-2 **:data-[slot=command-item]:py-3 [&_[data-slot=command-group]~[data-slot=command-group]]:pt-0 [&_[data-slot=command-input-wrapper]_svg]:h-5 [&_[data-slot=command-input-wrapper]_svg]:w-5 [&_[data-slot=command-item]_svg]:h-5 [&_[data-slot=command-item]_svg]:w-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  onChange,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & {
  onValueChange?: (value: string) => void
}) {
  const { search, setSearch, activeId, listId } = useCommand('CommandInput')
  return (
    <div
      data-slot='command-input-wrapper'
      className='flex h-9 items-center gap-2 border-b px-3'
    >
      <SearchIcon className='size-4 shrink-0 opacity-50' />
      <input
        data-slot='command-input'
        type='text'
        role='combobox'
        aria-expanded='true'
        aria-autocomplete='list'
        aria-controls={listId}
        aria-activedescendant={activeId ?? undefined}
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  const { listId } = useCommand('CommandList')
  return (
    <div
      data-slot='command-list'
      id={listId}
      role='listbox'
      className={cn(
        'max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto',
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  const { visibleCount } = useCommand('CommandEmpty')
  if (visibleCount > 0) return null
  return (
    <div
      data-slot='command-empty'
      role='presentation'
      className={cn('py-6 text-center text-sm', className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'heading'> & {
  heading?: React.ReactNode
}) {
  const headingId = React.useId()
  return (
    <div
      data-slot='command-group'
      role='presentation'
      className={cn(
        // a group whose items are all filtered out disappears with them
        'overflow-hidden p-1 text-foreground not-has-[[data-slot=command-item]]:hidden',
        className
      )}
      {...props}
    >
      {heading && (
        <div
          id={headingId}
          data-slot='command-group-heading'
          aria-hidden
          className='px-2 py-1.5 text-xs font-medium text-muted-foreground'
        >
          {heading}
        </div>
      )}
      <div role='group' aria-labelledby={heading ? headingId : undefined}>
        {children}
      </div>
    </div>
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { search } = useCommand('CommandSeparator')
  if (search) return null
  return (
    <div
      data-slot='command-separator'
      role='separator'
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  value,
  keywords,
  disabled,
  onSelect,
  onClick,
  onPointerMove,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSelect' | 'value'> & {
  value?: string
  keywords?: string[]
  disabled?: boolean
  onSelect?: (value: string) => void
}) {
  const { search, shouldFilter, activeId, setActiveId, registerItem } =
    useCommand('CommandItem')
  const id = React.useId()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [textValue, setTextValue] = React.useState('')

  // Like the old library: without an explicit `value`, the text content is it.
  React.useLayoutEffect(() => {
    const text = ref.current?.textContent?.trim()
    if (text !== undefined && text !== textValue) setTextValue(text)
  })

  const itemValue = value ?? textValue
  const query = search.trim().toLowerCase()
  const matches =
    !shouldFilter ||
    !query ||
    [itemValue, ...(keywords ?? [])].join(' ').toLowerCase().includes(query)

  React.useLayoutEffect(() => {
    if (!matches) return
    return registerItem(id)
  }, [matches, id, registerItem])

  if (!matches) return null

  const selected = activeId === id
  return (
    <div
      ref={ref}
      id={id}
      data-slot='command-item'
      role='option'
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-selected={selected}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (!disabled && !selected) setActiveId(id)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (!disabled) onSelect?.(itemValue)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='command-shortcut'
      className={cn(
        'ms-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
