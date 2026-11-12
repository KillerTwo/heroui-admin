import * as React from 'react'
import { Avatar as HeroAvatar } from '@heroui/react'
import { cn } from '@/lib/utils'

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof HeroAvatar>) {
  return (
    <HeroAvatar
      data-slot='avatar'
      className={cn(
        // Hero root: size-10, bg-default; legacy: size-8, transparent.
        'relative flex size-8 shrink-0 overflow-hidden rounded-full bg-transparent',
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof HeroAvatar.Image>) {
  return (
    <HeroAvatar.Image
      data-slot='avatar-image'
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof HeroAvatar.Fallback>) {
  return (
    <HeroAvatar.Fallback
      data-slot='avatar-fallback'
      className={cn(
        // Hero fallback adds text-sm/font-medium and a coloured text; legacy
        // inherits both from the surrounding text.
        'flex size-full items-center justify-center rounded-full bg-muted font-[inherit] text-[length:inherit] text-inherit',
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
