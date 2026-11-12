import * as React from 'react'
import { Drawer } from '@heroui/react'
import { XIcon } from 'lucide-react'
import {
  hasChildOfType,
  markPassthrough,
  OverlayControlContext,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FocusFirstTabbable } from '@/components/ui/overlay-trigger'
import { PressTrigger } from '@/components/ui/overlay-trigger'

type DescriptionRegistry = {
  id: string
  setMounted: (mounted: boolean) => void
}

const DescriptionContext = React.createContext<DescriptionRegistry | null>(null)

function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  if (!hasChildOfType(children, SheetTrigger)) {
    // No trigger: skip DialogTrigger (it warns without a pressable child).
    return (
      <OverlayControlContext value={{ open, defaultOpen, onOpenChange }}>
        {children}
      </OverlayControlContext>
    )
  }
  return (
    <Drawer
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      data-slot='sheet'
    >
      {children}
    </Drawer>
  )
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof PressTrigger>) {
  return <PressTrigger data-slot='sheet-trigger' {...props} />
}
markPassthrough(SheetTrigger)

function SheetClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    return React.cloneElement(children, {
      'data-slot': 'sheet-close',
      slot: 'close',
      ...props,
    })
  }
  return (
    <Button
      data-slot='sheet-close'
      type='button'
      variant='ghost'
      {...({ slot: 'close' } as object)}
      {...props}
    >
      {children}
    </Button>
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  const control = React.use(OverlayControlContext)
  const id = React.useId()
  const [hasDescription, setHasDescription] = React.useState(false)
  const registry = React.useMemo(
    () => ({ id, setMounted: setHasDescription }),
    [id]
  )

  return (
    <Drawer.Backdrop
      data-slot='sheet-overlay'
      variant='transparent'
      className='z-50 bg-black/50'
      isOpen={control?.open}
      defaultOpen={control?.defaultOpen}
      onOpenChange={control?.onOpenChange}
    >
      <Drawer.Content placement={side} className='z-50'>
        <DescriptionContext value={registry}>
          {/* Hero's .drawer__dialog (lower layer) is re-skinned by utilities */}
          <Drawer.Dialog
            data-slot='sheet-content'
            aria-describedby={hasDescription ? id : undefined}
            className={cn(
              'relative flex flex-col gap-4 rounded-none bg-background p-0 shadow-lg',
              side === 'right' &&
                'h-full w-3/4 max-w-none border-s sm:max-w-sm',
              side === 'left' && 'h-full w-3/4 max-w-none border-e sm:max-w-sm',
              side === 'top' && 'h-auto max-h-none w-full border-b',
              side === 'bottom' && 'h-auto max-h-none w-full border-t',
              className
            )}
            {...(props as object)}
          >
            <FocusFirstTabbable />
            {children}
            <Drawer.CloseTrigger
              data-slot='sheet-close'
              className="absolute inset-e-4 top-4 size-auto rounded-xs bg-transparent p-0 text-inherit opacity-70 ring-offset-background transition-opacity hover:bg-transparent hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:m-0 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
            </Drawer.CloseTrigger>
          </Drawer.Dialog>
        </DescriptionContext>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof Drawer.Heading>) {
  return (
    <Drawer.Heading
      data-slot='sheet-title'
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const registry = React.use(DescriptionContext)
  const setMounted = registry?.setMounted
  React.useLayoutEffect(() => {
    setMounted?.(true)
    return () => setMounted?.(false)
  }, [setMounted])
  return (
    <div
      id={registry?.id}
      data-slot='sheet-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
