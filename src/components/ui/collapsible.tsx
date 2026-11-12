import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@/components/ui/slot'

type CollapsibleContextValue = {
  open: boolean
  disabled: boolean
  contentId: string
  toggle: () => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null
)

function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) {
    throw new Error('Collapsible parts must be used within <Collapsible>.')
  }
  return ctx
}

const CLOSE_DELAY_MS = 200

function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  asChild = false,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  asChild?: boolean
}) {
  const [internal, setInternal] = React.useState(defaultOpen)
  const open = openProp ?? internal
  const contentId = React.useId()

  const toggle = React.useCallback(() => {
    if (disabled) return
    const next = !open
    if (openProp === undefined) setInternal(next)
    onOpenChange?.(next)
  }, [disabled, open, openProp, onOpenChange])

  const value = React.useMemo(
    () => ({ open, disabled, contentId, toggle }),
    [open, disabled, contentId, toggle]
  )

  const Comp = asChild ? Slot : 'div'
  return (
    <CollapsibleContext value={value}>
      <Comp
        data-slot='collapsible'
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        {...props}
      />
    </CollapsibleContext>
  )
}

function CollapsibleTrigger({
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { open, disabled, contentId, toggle } = useCollapsible()
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='collapsible-trigger'
      data-state={open ? 'open' : 'closed'}
      aria-controls={contentId}
      aria-expanded={open}
      {...(!asChild && { type: 'button' as const })}
      {...(disabled && { disabled: true })}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggle()
      }}
      {...props}
    />
  )
}

/**
 * Height animation without Radix' `--radix-collapsible-content-height`: the
 * wrapper animates `grid-template-rows` between `0fr` and `1fr`. Children are
 * unmounted once the close transition has finished (same as Radix).
 */
function CollapsibleContent({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const { open, contentId } = useCollapsible()
  const [mounted, setMounted] = React.useState(open)
  const [expanded, setExpanded] = React.useState(open)

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      // Let the collapsed frame paint first so the grid transition runs.
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setExpanded(true))
      )
      return () => cancelAnimationFrame(frame)
    }
    setExpanded(false)
    const timer = setTimeout(() => setMounted(false), CLOSE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [open])

  return (
    <div
      id={contentId}
      data-slot='collapsible-content'
      data-state={open ? 'open' : 'closed'}
      className={cn(
        mounted ? 'grid' : 'hidden',
        'transition-[grid-template-rows] duration-200 ease-out',
        expanded && open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
      {...props}
    >
      <div className='min-h-0 overflow-hidden'>{mounted && children}</div>
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
