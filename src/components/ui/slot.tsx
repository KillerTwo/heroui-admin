import * as React from 'react'
import { cn } from '@/lib/utils'

type AnyProps = Record<string, unknown>

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.RefObject<T | null>).current = value
}

/**
 * Local replacement for Radix `Slot`: merges its props into the single child
 * element (child wins, except handlers/className/style which are combined).
 */
function Slot({
  children,
  ref,
  ...slotProps
}: React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<unknown>
  children?: React.ReactNode
}) {
  if (!React.isValidElement<AnyProps>(children)) return null

  const childProps = children.props
  const merged: AnyProps = { ...slotProps, ...childProps }

  for (const key of Object.keys(slotProps)) {
    const slotValue = (slotProps as AnyProps)[key]
    const childValue = childProps[key]
    if (/^on[A-Z]/.test(key)) {
      if (typeof slotValue === 'function' && typeof childValue === 'function') {
        merged[key] = (...args: unknown[]) => {
          childValue(...args)
          slotValue(...args)
        }
      }
    } else if (key === 'style') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    } else if (key === 'className') {
      merged[key] = cn(slotValue as string, childValue as string)
    }
  }

  const childRef = childProps.ref as React.Ref<unknown> | undefined
  if (ref || childRef) {
    merged.ref = (node: unknown) => {
      setRef(ref, node)
      setRef(childRef, node)
    }
  }

  return React.cloneElement(children, merged)
}

export { Slot }
