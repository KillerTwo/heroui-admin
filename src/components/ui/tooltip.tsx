'use client'

import * as React from 'react'
import { Tooltip as HeroTooltip } from '@heroui/react'
import {
  markPassthrough,
  toPlacement,
  type OverlayAlign,
  type OverlaySide,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { FocusTrigger } from '@/components/ui/overlay-trigger'

const TooltipDelayContext = React.createContext(0)

/** React Aria has no provider; this only carries the default delay (ms). */
function TooltipProvider({
  delayDuration = 0,
  children,
}: {
  delayDuration?: number
  children?: React.ReactNode
}) {
  return (
    <TooltipDelayContext value={delayDuration}>{children}</TooltipDelayContext>
  )
}

function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  children?: React.ReactNode
}) {
  const defaultDelay = React.use(TooltipDelayContext)
  return (
    <HeroTooltip
      data-slot='tooltip'
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delay={delayDuration ?? defaultDelay}
      closeDelay={0}
    >
      {children}
    </HeroTooltip>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof FocusTrigger>) {
  return <FocusTrigger data-slot='tooltip-trigger' {...props} />
}
markPassthrough(TooltipTrigger)

function TooltipContent({
  className,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  hidden,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  side?: OverlaySide
  align?: OverlayAlign
  sideOffset?: number
}) {
  if (hidden) return null
  return (
    <HeroTooltip.Content
      data-slot='tooltip-content'
      placement={toPlacement(side, align)}
      offset={sideOffset}
      className={cn(
        // Hero's .tooltip lives in a lower layer; these utilities restyle it
        // to the legacy primary tooltip.
        'z-50 w-fit max-w-none rounded-md bg-primary px-3 py-1.5 text-xs text-balance break-normal text-primary-foreground shadow-none',
        '**:data-[slot=overlay-arrow]:fill-primary **:data-[slot=overlay-arrow]:stroke-primary',
        className
      )}
      {...(props as object)}
    >
      {children}
      <HeroTooltip.Arrow />
    </HeroTooltip.Content>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
