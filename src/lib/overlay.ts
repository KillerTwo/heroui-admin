import * as React from 'react'

export type OverlaySide = 'top' | 'right' | 'bottom' | 'left'
export type OverlayAlign = 'start' | 'center' | 'end'

/**
 * Radix-style `side` + `align` -> React Aria `placement` string
 * (e.g. `top`, `bottom end`, `right top`).
 */
export function toPlacement(
  side: OverlaySide = 'bottom',
  align: OverlayAlign = 'center'
) {
  if (align === 'center') return side
  const vertical = side === 'top' || side === 'bottom'
  const cross = vertical ? align : align === 'start' ? 'top' : 'bottom'
  return `${side} ${cross}` as
    | 'top start'
    | 'top end'
    | 'bottom start'
    | 'bottom end'
    | 'left top'
    | 'left bottom'
    | 'right top'
    | 'right bottom'
}

/**
 * Plain text of a React subtree. React Aria needs `textValue` on collection
 * items whose children are not a plain string (type-ahead + a11y).
 */
export function getTextValue(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextValue).join('')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getTextValue(node.props.children)
  }
  return ''
}

type OverlayControl = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Set by dialog-like roots rendered *without* a trigger: React Aria's
 * `DialogTrigger` warns when it has no pressable child, so such roots skip it
 * and hand their open state to the overlay (`ModalOverlay`) directly.
 */
export const OverlayControlContext = React.createContext<OverlayControl | null>(
  null
)

/** Shallow check: is one of the direct children an element of `type`? */
export function hasChildOfType(
  children: React.ReactNode,
  type: React.ElementType
): boolean {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === type
  )
}

/**
 * Elements that already consume React Aria's press/focus contexts (Hero
 * `Button` + our overlay triggers). Overlay triggers hand their props to these
 * directly; anything else (native elements, Radix `Slot` based components) is
 * wrapped in `Pressable` / `Focusable`.
 */
const passthroughTypes = new WeakSet<object>()

export function markPassthrough<T extends object>(component: T): T {
  passthroughTypes.add(component)
  return component
}

export function isPassthroughElement(node: React.ReactNode): boolean {
  return (
    React.isValidElement(node) &&
    typeof node.type !== 'string' &&
    passthroughTypes.has(node.type as object)
  )
}

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Ref callback for modal dialogs: Radix moved focus to the first tabbable
 * descendant on open, React Aria focuses the dialog itself. Runs before React
 * Aria's own focus effect, which then sees focus already inside and skips.
 */
export function focusFirstTabbable(node: HTMLElement | null) {
  if (!node || node.contains(document.activeElement)) return
  node.querySelector<HTMLElement>(TABBABLE)?.focus({ preventScroll: true })
}
