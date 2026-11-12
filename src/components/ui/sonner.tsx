import { useEffect, type ComponentProps, type ReactNode } from 'react'
import {
  toast as heroToast,
  Toast,
  type HeroUIToastOptions,
  type ToastPromiseOptions,
} from '@heroui/react'
import { cn } from '@/lib/utils'

// Sonner-compatible facade over the Hero Toast queue, so call sites keep using
// `toast(...)`, `toast.error(...)`, `toast.message(...)` and `toast.promise(...)`.

type ToastOptions = Omit<HeroUIToastOptions, 'variant' | 'timeout'> & {
  /** Auto-dismiss timeout in ms (sonner name); 0 keeps the toast open. */
  duration?: number
}

const FALLBACK_DURATION = 5000

// Set by the mounted <Toaster duration>; restored on unmount.
let defaultDuration = FALLBACK_DURATION

function resolve(options?: ToastOptions): HeroUIToastOptions {
  const { duration, ...rest } = options ?? {}
  return { ...rest, timeout: duration ?? defaultDuration }
}

function base(message: ReactNode, options?: ToastOptions) {
  return heroToast(message, resolve(options))
}

function promise<T>(
  source: Promise<T> | (() => Promise<T>),
  options: ToastPromiseOptions<T>
) {
  const settled = typeof source === 'function' ? source() : source
  // Persistent while loading; the countdown starts once the promise settles.
  const id = heroToast(options.loading, { isLoading: true, timeout: 0 })

  settled
    .then((data) =>
      heroToast.update(
        id,
        typeof options.success === 'function'
          ? options.success(data)
          : options.success,
        { isLoading: false, variant: 'success', timeout: defaultDuration }
      )
    )
    .catch((error: Error) =>
      heroToast.update(
        id,
        typeof options.error === 'function'
          ? options.error(error)
          : options.error,
        { isLoading: false, variant: 'danger', timeout: defaultDuration }
      )
    )

  return id
}

const toast = Object.assign(base, {
  message: base,
  success: (message: ReactNode, options?: ToastOptions) =>
    heroToast.success(message, resolve(options)),
  error: (message: ReactNode, options?: ToastOptions) =>
    heroToast.danger(message, resolve(options)),
  info: (message: ReactNode, options?: ToastOptions) =>
    heroToast.info(message, resolve(options)),
  warning: (message: ReactNode, options?: ToastOptions) =>
    heroToast.warning(message, resolve(options)),
  promise,
  getQueue: () => heroToast.getQueue(),
  dismiss: (id?: string) => (id ? heroToast.close(id) : heroToast.clear()),
})

type ToasterProps = {
  /** Default auto-dismiss timeout in ms. */
  duration?: number
  placement?: ComponentProps<typeof Toast.Provider>['placement']
  className?: string
}

// Hero's `.toast*` rules use `--muted` as text colour, which in this app is the
// legacy muted *surface*; pin the old popover look with explicit utilities.
const toastClasses = cn(
  '[&_.toast]:rounded-lg [&_.toast]:border [&_.toast]:border-border [&_.toast]:bg-popover [&_.toast]:text-popover-foreground',
  '[&_[data-slot=toast-description]]:block [&_[data-slot=toast-description]]:w-full [&_[data-slot=toast-description]]:text-muted-foreground'
)

function Toaster({
  duration,
  placement = 'bottom end',
  className,
}: ToasterProps) {
  useEffect(() => {
    if (duration === undefined) return
    const previous = defaultDuration
    defaultDuration = duration
    return () => {
      defaultDuration = previous
    }
  }, [duration])

  return (
    <Toast.Provider
      placement={placement}
      className={cn(toastClasses, className)}
    />
  )
}

export { Toaster, toast }
export type { ToasterProps, ToastOptions }
