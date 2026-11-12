import * as React from 'react'
import { Chip } from '@heroui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  // `rounded-md` / `gap-1`: pin legacy metrics over Hero's chip
  // defaults (rounded-2xl, leading-5, gap-0.5).
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium [--tw-leading:initial] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const heroChip = {
  default: { variant: 'primary', color: 'accent' },
  secondary: { variant: 'secondary', color: 'default' },
  destructive: { variant: 'primary', color: 'danger' },
  outline: { variant: 'tertiary', color: 'default' },
} as const satisfies Record<
  BadgeVariant,
  {
    variant: 'primary' | 'secondary' | 'tertiary'
    color: 'accent' | 'default' | 'danger'
  }
>

function Badge({
  className,
  variant,
  children,
  ...props
}: Omit<React.ComponentProps<'span'>, 'color'> &
  VariantProps<typeof badgeVariants>) {
  return (
    <Chip
      data-slot='badge'
      size='md'
      {...heroChip[variant ?? 'default']}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {/* Fragment: Chip wraps bare string children in a padded Chip.Label. */}
      <>{children}</>
    </Chip>
  )
}

export { Badge, badgeVariants }
