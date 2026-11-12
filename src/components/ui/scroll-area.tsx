import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * HeroUI v3 ships no ScrollArea (its `ScrollShadow` adds a fade mask, which
 * would change the look), so this is a project-owned wrapper around native
 * scrolling. The thin themed scrollbar comes from the global
 * `scrollbar-width: thin; scrollbar-color: var(--border) transparent` rule.
 */
interface ScrollAreaProps extends React.ComponentProps<'div'> {
  orientation?: 'vertical' | 'horizontal'
  /** Radix API leftovers; native scrollbars are always overlay-on-demand. */
  type?: 'auto' | 'always' | 'scroll' | 'hover'
  scrollHideDelay?: number
}

function ScrollArea({
  className,
  children,
  orientation = 'vertical',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollHideDelay,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      data-slot='scroll-area'
      className={cn('relative', className)}
      {...props}
    >
      <div
        data-slot='scroll-area-viewport'
        className={cn(
          'size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1',
          orientation === 'horizontal'
            ? 'overflow-x-auto overflow-y-hidden'
            : 'overflow-x-hidden overflow-y-auto'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { ScrollArea }
