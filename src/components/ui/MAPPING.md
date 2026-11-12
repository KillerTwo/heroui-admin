# UI component mapping (shadcn/Radix -> HeroUI v3)

Skeleton created in Task 3. Target and status are filled in as components are replaced.

Targets: **Hero** = `@heroui/react`; **local** = project-owned wrapper; **lib** = standalone library (e.g. cmdk, sonner, react-day-picker, input-otp).

## Known token collisions (see `src/styles/heroui-bridge.css`)

- `--muted`: shadcn = muted surface, Hero = muted text. Left on shadcn semantics until components are replaced.
- `--accent`: shadcn = hover surface, Hero = brand colour. Left on shadcn semantics until components are replaced.

| File | Target | Status |
|---|---|---|
| `alert-dialog.tsx` | Hero `AlertDialog` (Cancel/Action are `slot=close` Buttons; Escape dismiss kept) | done |
| `alert.tsx` | TBD (Hero / local / standalone lib) | pending |
| `avatar.tsx` | Hero `Avatar` (Root/Image/Fallback) | done |
| `badge.tsx` | Hero `Chip` (shadcn classes pin metrics; no `asChild`) | done |
| `button.tsx` | Hero `Button` (`buttonVariants` kept as class source; no `asChild`; native `type=submit` default kept) | done |
| `calendar.tsx` | TBD (Hero / local / standalone lib) | pending |
| `card.tsx` | Hero `Card` (Title/Description rendered as `div`; `CardAction` local) | done |
| `checkbox.tsx` | Hero `Checkbox` (Radix-style `checked`/`onCheckedChange`) | done |
| `collapsible.tsx` | TBD (Hero / local / standalone lib) | pending |
| `command.tsx` | TBD (Hero / local / standalone lib) | pending |
| `dialog.tsx` | Hero `Modal` (Backdrop/Container/Dialog; X is `Modal.CloseTrigger`; `modal` accepted+ignored) | done |
| `dropdown-menu.tsx` | Hero `Dropdown` (Popover/Menu/Item/Section; `onSelect`->`onAction`, `href` items, checkbox/radio = selection Sections) | done |
| `form.tsx` | TBD (Hero / local / standalone lib) | pending (Task 5 only added `formLabelId` + `aria-labelledby`, FormControl passthrough) |
| `input-otp.tsx` | TBD (Hero / local / standalone lib) | pending |
| `input.tsx` | Hero `Input` (RAC input) | done |
| `label.tsx` | Hero `Label` (`slot={null}` opts out of RAC label context) | done |
| `popover.tsx` | Hero `Popover` (Trigger = `PressTrigger`; no `PopoverAnchor`) | done |
| `radio-group.tsx` | Hero `RadioGroup` + `Radio` (`onValueChange`/`disabled` kept) | done |
| `scroll-area.tsx` | local native-scroll wrapper (no custom scrollbar; `ScrollBar` export dropped) | done |
| `select.tsx` | Hero `Select` + `ListBox` (value/onValueChange kept; trigger is a `button`, not `combobox`; scroll buttons dropped) | done |
| `separator.tsx` | Hero `Separator` (`decorative` -> `isDecorative`) | done |
| `sheet.tsx` | Hero `Drawer` (side -> placement; X is `Drawer.CloseTrigger`, direct child of the dialog) | done |
| `sidebar.tsx` | TBD (Hero / local / standalone lib) | pending |
| `skeleton.tsx` | Hero `Skeleton` (pulse) | done |
| `sonner.tsx` | TBD (Hero / local / standalone lib) | pending |
| `switch.tsx` | Hero `Switch` (Radix-style `checked`/`onCheckedChange`) | done |
| `table.tsx` | TBD (Hero / local / standalone lib) | pending |
| `tabs.tsx` | Hero `Tabs` (`value`/`onValueChange` kept; every panel mounted, only the selected renders children) | done |
| `textarea.tsx` | Hero `TextArea` (RAC textarea) | done |
| `tooltip.tsx` | Hero `Tooltip` (`TooltipProvider` only carries the default delay) | done |

## Task 4 notes (A-class adapters)

- Hero's --accent/--muted collision is resolved per component with explicit shadcn utility classes (utilities layer beats Hero's components layer); the global tokens are untouched.
- Hero resets that leak into shadcn metrics are neutralised in the wrapper classes: `.button` svg margins (`heroui-bridge.css`, same layer so call-site `ms-*` wins), `.button` `transform-gpu`/pressed scale, `.chip`/`.card__*` `--tw-leading` (`[--tw-leading:initial]`), Chip.Label padding (children wrapped in a fragment), Card `p-4`/Content flex.
- Radix `<XTrigger asChild><Button/></XTrigger>` still works with the Hero button (menus/popovers/tooltips open); those call sites go away with the overlay tasks.
- React Aria radio/checkbox/switch keep a visually hidden native input: tests should click the label text, not `getByRole('radio')`.

## Task 5 notes (overlays + select)

- Radix `asChild` triggers are kept via `overlay-trigger.tsx` (`PressTrigger` / `FocusTrigger`): Hero `Button`, `FormControl` and nested overlay triggers are "passthrough" (they already read React Aria's press/focus contexts); anything else (div, native element) is wrapped in `Pressable` / `Focusable`. Regression coverage: `overlay-triggers.test.tsx`.
- Radix `data-state=open` -> `aria-expanded`; `--radix-*-trigger-width` -> `--trigger-width`; item highlight -> `data-[focused=true]` (React Aria focuses on hover).
- Radix `side` + `align` -> React Aria `placement` (`toPlacement` in `src/lib/overlay.ts`).
- Menu items that were `Link asChild` use `href`; `src/main.tsx` bridges React Aria navigation to TanStack Router via `RouterProvider`.
- Radix moved focus to the first tabbable on open; React Aria focuses the dialog. `FocusFirstTabbable` (Dialog, Sheet) restores the Radix behaviour.
- Select trigger is a `button[aria-haspopup=listbox]` (React Aria cannot set `role=combobox`); `FormControl` now sets `aria-labelledby` so the label still names it.
- Dropped exports: `Dialog/Sheet/AlertDialog` Portal + Overlay, `DropdownMenuPortal`, `PopoverAnchor`, `ScrollBar`, `SelectScrollUp/DownButton`.
- Removed Radix packages: alert-dialog, dialog, dropdown-menu, popover, select, tabs, tooltip, scroll-area. Still used: collapsible, direction, label, radio-group, slot, icons.
