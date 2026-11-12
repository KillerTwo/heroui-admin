import * as React from 'react'
import { Card as HeroCard } from '@heroui/react'
import { cn } from '@/lib/utils'

// Hero renders Title as <h3> and Description as <p>; legacy used plain
// <div>s, and consumers nest block content in them, so keep <div>.
const asDiv = (props: object) => (
  <div {...(props as React.ComponentProps<'div'>)} />
)

function Card({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard
      data-slot='card'
      className={cn(
        // `px-0`: Hero's `p-4` would otherwise leak horizontal padding.
        'flex flex-col gap-6 rounded-xl border bg-card px-0 py-6 text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </HeroCard>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard.Header
      data-slot='card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard.Title
      render={asDiv}
      data-slot='card-title'
      className={cn(
        'text-[length:inherit] leading-none font-semibold text-inherit [--tw-leading:initial]',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard.Description
      render={asDiv}
      data-slot='card-description'
      className={cn(
        'text-sm text-muted-foreground [--tw-leading:initial]',
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard.Content
      data-slot='card-content'
      // Hero content is `flex flex-1 flex-col gap-1`.
      className={cn('block flex-none gap-0 px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <HeroCard.Footer
      data-slot='card-footer'
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
