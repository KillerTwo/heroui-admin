import * as React from 'react'
import { Button as HeroButton } from '@heroui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Class source of truth for the shadcn look. It is also used standalone
 * (`buttonVariants()` on links / other elements), so it carries the full
 * visual contract. Hero's own `.button*` rules live in lower CSS layers, so
 * these utilities win; the extra resets below neutralise Hero defaults that
 * would otherwise leak through (svg margins, pressed scale, `--accent` brand
 * colour vs shadcn's `--accent` hover surface).
 */
const buttonVariants = cva(
  "inline-flex w-auto items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transform-none",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 data-[hovered=true]:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background text-inherit shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'bg-transparent text-inherit hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

const heroVariant = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'ghost',
} as const satisfies Record<ButtonVariant, string>

function Button({
  className,
  variant,
  size,
  disabled,
  type = 'submit',
  ...props
}: Omit<React.ComponentProps<'button'>, 'color'> &
  VariantProps<typeof buttonVariants>) {
  return (
    <HeroButton
      data-slot='button'
      variant={heroVariant[variant ?? 'default']}
      isDisabled={disabled}
      // Native <button> defaults to type=submit; React Aria defaults to
      // button. Keep the shadcn behaviour so forms keep submitting.
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as Omit<
        React.ComponentProps<typeof HeroButton>,
        'variant' | 'className'
      >)}
    />
  )
}

export { Button, buttonVariants }
