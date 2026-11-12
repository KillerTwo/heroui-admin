'use client'

import * as React from 'react'
import { Modal } from '@heroui/react'
import { XIcon } from 'lucide-react'
import {
  hasChildOfType,
  markPassthrough,
  OverlayControlContext,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FocusFirstTabbable,
  PressTrigger,
  useOrphanTriggerWarning,
} from '@/components/ui/overlay-trigger'

type DescriptionRegistry = {
  id: string
  setMounted: (mounted: boolean) => void
}

const DescriptionContext = React.createContext<DescriptionRegistry | null>(null)

function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?(open: boolean): void
  /** Radix API leftover: Modal is always modal. */
  modal?: boolean
  children?: React.ReactNode
}) {
  if (!hasChildOfType(children, DialogTrigger)) {
    // No trigger: skip DialogTrigger (it warns without a pressable child).
    return (
      <OverlayControlContext value={{ open, defaultOpen, onOpenChange }}>
        {children}
      </OverlayControlContext>
    )
  }
  return (
    // reset: a trigger below this root is attached, not orphaned
    <OverlayControlContext value={null}>
      <Modal
        isOpen={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        data-slot='dialog'
      >
        {children}
      </Modal>
    </OverlayControlContext>
  )
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof PressTrigger>) {
  useOrphanTriggerWarning('DialogTrigger')
  return <PressTrigger data-slot='dialog-trigger' {...props} />
}
markPassthrough(DialogTrigger)

/**
 * Closes the surrounding dialog. React Aria wires `slot='close'` buttons to
 * the dialog's close handler.
 */
function DialogClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    return React.cloneElement(children, {
      'data-slot': 'dialog-close',
      slot: 'close',
      ...props,
    })
  }
  return (
    <Button
      data-slot='dialog-close'
      type='button'
      variant='ghost'
      {...({ slot: 'close' } as object)}
      {...props}
    >
      {children}
    </Button>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  showCloseButton?: boolean
}) {
  const control = React.use(OverlayControlContext)
  const id = React.useId()
  const [hasDescription, setHasDescription] = React.useState(false)
  const registry = React.useMemo(
    () => ({ id, setMounted: setHasDescription }),
    [id]
  )

  return (
    <Modal.Backdrop
      data-slot='dialog-overlay'
      variant='transparent'
      className='z-50 bg-black/50'
      isOpen={control?.open}
      defaultOpen={control?.defaultOpen}
      onOpenChange={control?.onOpenChange}
    >
      {/* the container only positions; the dialog itself carries the box */}
      <Modal.Container
        placement='center'
        className='w-full p-0 sm:w-full sm:p-0'
      >
        <DescriptionContext value={registry}>
          <Modal.Dialog
            data-slot='dialog-content'
            aria-describedby={hasDescription ? id : undefined}
            className={cn(
              'relative grid w-full max-w-[calc(100%-2rem)] gap-4 overflow-visible rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg',
              className
            )}
            {...(props as object)}
          >
            <FocusFirstTabbable />
            {children}
            {showCloseButton && (
              <Modal.CloseTrigger
                data-slot='dialog-close'
                className="absolute inset-e-4 top-4 size-auto rounded-xs bg-transparent p-0 text-inherit opacity-70 ring-offset-background transition-opacity hover:bg-transparent hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:m-0 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <XIcon />
              </Modal.CloseTrigger>
            )}
          </Modal.Dialog>
        </DescriptionContext>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-start', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Modal.Heading>) {
  return (
    <Modal.Heading
      data-slot='dialog-title'
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
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
      data-slot='dialog-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
