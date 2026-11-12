import * as React from 'react'
import { Label as HeroLabel } from '@heroui/react'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <HeroLabel
      data-slot='label'
      // React Aria labels register themselves with the nearest RadioGroup /
      // TextField / etc. via context (and render as <span>). legacy labels
      // are plain `<label for>` elements, so opt out of slotted context.
      // (Typed as `string | undefined` by Hero; `null` is the documented RAC opt-out.)
      slot={null as unknown as undefined}
      className={cn(
        // `text-inherit` / `font-medium` / `text-sm`: legacy Label never set a
        // colour, Hero's `.label` sets `text-foreground`.
        'flex items-center gap-2 text-sm leading-none font-medium text-inherit select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Label }
