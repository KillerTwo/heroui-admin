import * as React from 'react'
import { Skeleton as HeroSkeleton } from '@heroui/react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroSkeleton
      data-slot='skeleton'
      animationType='pulse'
      className={cn(
        // Hero skeleton is `relative overflow-hidden pointer-events-none
        // rounded-sm bg-surface-tertiary/70`.
        'overflow-visible rounded-md bg-accent',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
