import * as React from 'react'
import { Popover as HeroPopover } from '@heroui/react'
import {
  markPassthrough,
  toPlacement,
  type OverlayAlign,
  type OverlaySide,
} from '@/lib/overlay'
import { cn } from '@/lib/utils'
import { PressTrigger } from '@/components/ui/overlay-trigger'

function Popover({
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
  return (
    <HeroPopover
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </HeroPopover>
  )
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PressTrigger>) {
  return <PressTrigger data-slot='popover-trigger' {...props} />
}
markPassthrough(PopoverTrigger)

function PopoverContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'dir'> & {
  side?: OverlaySide
  align?: OverlayAlign
  sideOffset?: number
}) {
  return (
    <HeroPopover.Content
      data-slot='popover-content'
      placement={toPlacement(side, align)}
      offset={sideOffset}
      // Hero's `.popover` rules live in a lower layer than these utilities.
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
        className
      )}
      {...(props as object)}
    >
      {/* padding lives on the content (callers pass `p-0`), not the dialog */}
      <HeroPopover.Dialog className='p-0 outline-hidden'>
        {children}
      </HeroPopover.Dialog>
    </HeroPopover.Content>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
