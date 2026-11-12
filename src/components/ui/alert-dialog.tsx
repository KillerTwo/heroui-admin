import * as React from 'react'
import { AlertDialog as HeroAlertDialog } from '@heroui/react'
import {
  hasChildOfType,
  markPassthrough,
  OverlayControlContext,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PressTrigger } from '@/components/ui/overlay-trigger'

type DescriptionRegistry = {
  id: string
  setMounted: (mounted: boolean) => void
}

const DescriptionContext = React.createContext<DescriptionRegistry | null>(null)

function AlertDialog({
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
  if (!hasChildOfType(children, AlertDialogTrigger)) {
    // No trigger: skip DialogTrigger (it warns without a pressable child).
    return (
      <OverlayControlContext value={{ open, defaultOpen, onOpenChange }}>
        {children}
      </OverlayControlContext>
    )
  }
  return (
    <HeroAlertDialog
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      data-slot='alert-dialog'
    >
      {children}
    </HeroAlertDialog>
  )
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof PressTrigger>) {
  return <PressTrigger data-slot='alert-dialog-trigger' {...props} />
}
markPassthrough(AlertDialogTrigger)

function AlertDialogContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'>) {
  const control = React.use(OverlayControlContext)
  const id = React.useId()
  const [hasDescription, setHasDescription] = React.useState(false)
  const registry = React.useMemo(
    () => ({ id, setMounted: setHasDescription }),
    [id]
  )

  return (
    <HeroAlertDialog.Backdrop
      data-slot='alert-dialog-overlay'
      variant='transparent'
      isOpen={control?.open}
      defaultOpen={control?.defaultOpen}
      onOpenChange={control?.onOpenChange}
      // Radix alert dialogs still close on Escape (not on outside press);
      // Hero disables Escape by default.
      isKeyboardDismissDisabled={false}
      className='z-50 bg-black/50'
    >
      <HeroAlertDialog.Container
        placement='center'
        className='w-full p-0 sm:w-full sm:p-0'
      >
        <DescriptionContext value={registry}>
          <HeroAlertDialog.Dialog
            data-slot='alert-dialog-content'
            aria-describedby={hasDescription ? id : undefined}
            className={cn(
              'relative grid w-full max-w-[calc(100%-2rem)] gap-4 overflow-visible rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg',
              className
            )}
            {...(props as object)}
          >
            {children}
          </HeroAlertDialog.Dialog>
        </DescriptionContext>
      </HeroAlertDialog.Container>
    </HeroAlertDialog.Backdrop>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-start', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof HeroAlertDialog.Heading>) {
  return (
    <HeroAlertDialog.Heading
      data-slot='alert-dialog-title'
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
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
      data-slot='alert-dialog-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

// `slot='close'` buttons are wired to the dialog's close handler by React Aria.
function AlertDialogAction({
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button type='button' {...({ slot: 'close' } as object)} {...props} />
}

function AlertDialogCancel({
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type='button'
      variant='outline'
      {...({ slot: 'close' } as object)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
