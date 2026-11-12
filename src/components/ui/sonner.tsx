import type { ReactNode } from 'react'
import {
  toast as heroToast,
  Toast,
  type HeroUIToastOptions,
  type ToastPromiseOptions,
} from '@heroui/react'

// Sonner-compatible facade over the Hero Toast queue, so call sites keep using
// `toast(...)`, `toast.error(...)`, `toast.message(...)` and `toast.promise(...)`.

type ToastOptions = Omit<HeroUIToastOptions, 'variant' | 'timeout'> & {
  /** Auto-dismiss timeout in ms (sonner name); 0 keeps the toast open. */
  duration?: number
}

let defaultDuration = 5000

function resolve(options?: ToastOptions): HeroUIToastOptions {
  const { duration, ...rest } = options ?? {}
  return { ...rest, timeout: duration ?? defaultDuration }
}

function base(message: ReactNode, options?: ToastOptions) {
  return heroToast(message, resolve(options))
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
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>
  ) => heroToast.promise(promise, options),
  dismiss: (id?: string) => (id ? heroToast.close(id) : heroToast.clear()),
})

type ToasterProps = {
  /** Default auto-dismiss timeout in ms. */
  duration?: number
  placement?: React.ComponentProps<typeof Toast.Provider>['placement']
}

function Toaster({ duration, placement = 'bottom end' }: ToasterProps) {
  if (duration !== undefined) defaultDuration = duration

  return <Toast.Provider placement={placement} />
}

export { Toaster, toast }
export type { ToasterProps, ToastOptions }
