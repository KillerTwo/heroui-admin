import * as React from 'react'
import { Focusable, Pressable } from '@heroui/react'
import {
  focusFirstTabbable,
  isPassthroughElement,
  markPassthrough,
  OverlayControlContext,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Hero Button is a React Aria button: it reads the PressResponder /
// Focusable contexts that overlay roots (DialogTrigger, MenuTrigger,
// TooltipTrigger, ...) provide, so no extra wrapper is needed around it.
markPassthrough(Button)

type TriggerProps = React.ComponentProps<'button'> & { asChild?: boolean }

function warnDev(message: string) {
  if (import.meta.env.DEV) console.warn(`[overlay-trigger] ${message}`)
}

/** DEV-only: `asChild` needs one element that can take props and a ref. */
function checkAsChildTarget(name: string, children: React.ReactNode) {
  if (!React.isValidElement(children) || children.type === React.Fragment) {
    warnDev(
      `<${name} asChild> needs a single element child (not a Fragment, text or list); the trigger will not attach and the overlay will not open.`
    )
  }
}

/**
 * DEV-only, for Dialog / Sheet / AlertDialog triggers. Their root only sets up
 * a trigger when it finds one among its (Fragment-flattened) children; a
 * trigger that sits behind another component lands in the trigger-less path,
 * where nothing can open it. Roots that did find a trigger reset the context.
 */
export function useOrphanTriggerWarning(name: string) {
  const orphan = React.use(OverlayControlContext) !== null
  React.useEffect(() => {
    if (orphan) {
      warnDev(
        `<${name}> was not found among the direct children of its root (it is probably wrapped in another component), so it cannot open the overlay. Render it as a direct child of the root, or control the root with open/onOpenChange.`
      )
    }
  }, [orphan, name])
}
// Pressable / Focusable want a DOM-ish element; our children can be any
// component that forwards props + ref to a DOM node (Hero Button, Slot, ...).
type PressableChild = React.ReactElement<
  React.DOMAttributes<HTMLElement>,
  string
>

function mergeChildProps(
  child: React.ReactElement<{ className?: string }>,
  props: Record<string, unknown>
) {
  // Same precedence as Radix `Slot`: child props win, className is merged.
  const { className, ...rest } = props as { className?: string }
  return React.cloneElement(child, {
    ...rest,
    ...child.props,
    className: cn(className, child.props.className) || undefined,
  })
}

/**
 * Replacement for the Radix `Trigger` + `asChild` pattern on top of React
 * Aria's `DialogTrigger` / `MenuTrigger`: makes the child (or a native
 * button) the pressable trigger.
 */
export function PressTrigger({ asChild, children, ...props }: TriggerProps) {
  if (asChild) checkAsChildTarget('PressTrigger', children)
  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    const child = mergeChildProps(children, props)
    return isPassthroughElement(children) ? (
      child
    ) : (
      <Pressable>{child as unknown as PressableChild}</Pressable>
    )
  }
  return (
    <Pressable>
      <button type='button' {...props}>
        {children}
      </button>
    </Pressable>
  )
}

/** Same as `PressTrigger`, for hover/focus triggers (tooltips). */
export function FocusTrigger({ asChild, children, ...props }: TriggerProps) {
  if (asChild) checkAsChildTarget('FocusTrigger', children)
  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    const child = mergeChildProps(children, props)
    return isPassthroughElement(children) ? (
      child
    ) : (
      <Focusable>{child as unknown as PressableChild}</Focusable>
    )
  }
  return (
    <Focusable>
      <button type='button' {...props}>
        {children}
      </button>
    </Focusable>
  )
}

/**
 * Render inside a modal dialog: moves focus to the first tabbable descendant
 * on open (Radix behaviour; React Aria focuses the dialog itself). Runs in a
 * layout effect, i.e. before React Aria's own focus effect, which then sees
 * focus already inside the dialog and leaves it alone.
 */
export function FocusFirstTabbable() {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useLayoutEffect(() => {
    const dialog = ref.current?.closest<HTMLElement>(
      '[role=dialog],[role=alertdialog]'
    )
    if (dialog) focusFirstTabbable(dialog)
  }, [])
  return <span ref={ref} hidden />
}
