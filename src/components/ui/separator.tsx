import * as React from 'react'
import { Separator as HeroSeparator } from '@heroui/react'
import { cn } from '@/lib/utils'

type SeparatorProps = Omit<
  React.ComponentProps<typeof HeroSeparator>,
  'isDecorative'
> & {
  /** Radix-compatible: purely visual, hidden from assistive tech. */
  decorative?: boolean
}

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <HeroSeparator
      data-slot='separator'
      isDecorative={decorative}
      orientation={orientation}
      className={cn(
        // Hero adds rounded-sm, min-h-2 and self-stretch on vertical
        // separators; shadcn has none of them.
        'shrink-0 rounded-none bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-0 data-[orientation=vertical]:w-px data-[orientation=vertical]:self-auto',
        className
      )}
      {...props}
    />
  )
}

export { Separator }
