import * as React from 'react'
import { Tabs as HeroTabs } from '@heroui/react'
import { cn } from '@/lib/utils'

// Hero's tab classes live in a lower CSS layer; the utilities below pin the
// shadcn segmented-control look on top of React Aria's Tabs behaviour.

const SelectedTabContext = React.createContext<string | undefined>(undefined)

function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof HeroTabs>,
  'selectedKey' | 'defaultSelectedKey' | 'onSelectionChange' | 'className'
> & {
  className?: string
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
}) {
  // Tracked here so inactive panels know not to render their children.
  const [internal, setInternal] = React.useState(defaultValue)
  const selected = value ?? internal
  return (
    <SelectedTabContext value={selected}>
      <HeroTabs
        data-slot='tabs'
        selectedKey={value}
        defaultSelectedKey={defaultValue}
        onSelectionChange={(key) => {
          setInternal(String(key))
          onValueChange?.(String(key))
        }}
        className={cn(
          'flex flex-col gap-2 data-[orientation=vertical]:flex-col',
          className
        )}
        {...props}
      />
    </SelectedTabContext>
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof HeroTabs.List>) {
  return (
    <HeroTabs.List
      data-slot='tabs-list'
      className={cn(
        'inline-flex h-9 w-fit min-w-0 flex-row items-center justify-center gap-0 rounded-lg bg-muted p-0.75 text-muted-foreground data-[orientation=vertical]:flex-row',
        className as string
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof HeroTabs.Tab>, 'id' | 'isDisabled'> & {
  value: string
  disabled?: boolean
}) {
  return (
    <HeroTabs.Tab
      data-slot='tabs-trigger'
      id={value}
      isDisabled={disabled}
      className={cn(
        "inline-flex h-[calc(100%-1px)] w-auto flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] hover:opacity-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-background data-[selected=true]:text-foreground data-[selected=true]:shadow-sm dark:text-muted-foreground dark:data-[selected=true]:border-input dark:data-[selected=true]:bg-input/30 dark:data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className as string
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof HeroTabs.Panel>,
  'id' | 'children' | 'shouldForceMount'
> & {
  value: string
  children?: React.ReactNode
}) {
  const selected = React.use(SelectedTabContext)
  return (
    // Radix keeps an (empty, hidden) element per inactive panel, which matters
    // for sibling selectors such as space-y-*. Mirror that: every panel is
    // mounted, but only the selected one renders its children.
    <HeroTabs.Panel
      data-slot='tabs-content'
      id={value}
      shouldForceMount
      className={cn(
        'flex-1 p-0 outline-none data-[inert=true]:hidden',
        className as string
      )}
      {...props}
    >
      {selected === value ? children : null}
    </HeroTabs.Panel>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
