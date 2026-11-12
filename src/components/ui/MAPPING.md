# UI component mapping (legacy Radix kit -> HeroUI v3)

All components are migrated (Task 8 closed the last ones).

Targets: **Hero** = `@heroui/react`; **local** = project-owned wrapper; **lib** = standalone library (e.g. react-day-picker, input-otp).

## Known token collisions (see `src/styles/heroui-bridge.css`)

- `--muted`: legacy = muted surface, Hero = muted text. Left on legacy semantics until components are replaced.
- `--accent`: legacy = hover surface, Hero = brand colour. Left on legacy semantics until components are replaced.

| File                | Target                                                                                                                                                                                                          | Status |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `alert-dialog.tsx`  | Hero `AlertDialog` (Cancel/Action are `slot=close` Buttons; Escape dismiss kept)                                                                                                                                | done   |
| `alert.tsx`         | local (plain `div[role=alert]` + cva; already free of Radix, no Hero equivalent needed to keep the pixel contract)                                                                                              | done   |
| `avatar.tsx`        | Hero `Avatar` (Root/Image/Fallback)                                                                                                                                                                             | done   |
| `badge.tsx`         | Hero `Chip` (legacy classes pin metrics; no `asChild`)                                                                                                                                                          | done   |
| `button.tsx`        | Hero `Button` (`buttonVariants` kept as class source; no `asChild`; native `type=submit` default kept)                                                                                                          | done   |
| `calendar.tsx`      | lib `react-day-picker` (day button is the project Hero `Button`; nav buttons use `buttonVariants`; no Radix)                                                                                                    | done   |
| `card.tsx`          | Hero `Card` (Title/Description rendered as `div`; `CardAction` local)                                                                                                                                           | done   |
| `checkbox.tsx`      | Hero `Checkbox` (Radix-style `checked`/`onCheckedChange`)                                                                                                                                                       | done   |
| `collapsible.tsx`   | local (context + `asChild` via local `Slot`; height animation = `grid-template-rows` 0fr/1fr, content unmounts after close; no Radix)                                                                           | done   |
| `command.tsx`       | local (search context + substring filter + arrow/Enter nav; shell is Hero `Modal` via `dialog.tsx` / Hero `Popover`; `cmdk` removed)                                                                            | done   |
| `dialog.tsx`        | Hero `Modal` (Backdrop/Container/Dialog; X is `Modal.CloseTrigger`; `modal` accepted+ignored)                                                                                                                   | done   |
| `dropdown-menu.tsx` | Hero `Dropdown` (Popover/Menu/Item/Section; `onSelect`->`onAction`, `href` items, checkbox/radio = selection Sections)                                                                                          | done   |
| `form.tsx`          | local (RHF context; `Label` = Hero label; `FormControl` uses the local `slot.tsx` prop merge instead of Radix `Slot`, still `markPassthrough` + `aria-labelledby`)                                              | done   |
| `input-otp.tsx`     | lib `input-otp` (unchanged; already Radix-free, legacy slot styling kept)                                                                                                                                       | done   |
| `input.tsx`         | Hero `Input` (RAC input)                                                                                                                                                                                        | done   |
| `label.tsx`         | Hero `Label` (`slot={null}` opts out of RAC label context)                                                                                                                                                      | done   |
| `popover.tsx`       | Hero `Popover` (Trigger = `PressTrigger`; no `PopoverAnchor`)                                                                                                                                                   | done   |
| `radio-group.tsx`   | Hero `RadioGroup` + `Radio` (`onValueChange`/`disabled` kept)                                                                                                                                                   | done   |
| `scroll-area.tsx`   | local native-scroll wrapper (no custom scrollbar; `ScrollBar` export dropped)                                                                                                                                   | done   |
| `select.tsx`        | Hero `Select` + `ListBox` (value/onValueChange kept; trigger is a `button`, not `combobox`; scroll buttons dropped)                                                                                             | done   |
| `separator.tsx`     | Hero `Separator` (`decorative` -> `isDecorative`)                                                                                                                                                               | done   |
| `sheet.tsx`         | Hero `Drawer` (side -> placement; X is `Drawer.CloseTrigger`, direct child of the dialog)                                                                                                                       | done   |
| `sidebar.tsx`       | local (Provider/cookie `sidebar_state`/shortcut unchanged; local `Slot` replaces Radix `Slot`; mobile = Hero `Drawer` via `sheet.tsx`, tooltip = Hero Tooltip, Button/Input/Separator/Skeleton = Hero adapters) | done   |
| `skeleton.tsx`      | Hero `Skeleton` (pulse)                                                                                                                                                                                         | done   |
| `sonner.tsx`        | Hero `Toast` (sonner-compatible facade: `toast` / `.error`->danger / `.message` / `.promise` / `.dismiss`, `Toaster` = `Toast.Provider` bottom end, `duration` -> `timeout`)                                    | done   |
| `switch.tsx`        | Hero `Switch` (Radix-style `checked`/`onCheckedChange`)                                                                                                                                                         | done   |
| `table.tsx`         | local (semantic `<table>` + Tailwind; Hero `Table` is a RAC grid with different DOM/roles, kept native for pixel parity and TanStack Table)                                                                     | done   |
| `tabs.tsx`          | Hero `Tabs` (`value`/`onValueChange` kept; every panel mounted, only the selected renders children)                                                                                                             | done   |
| `textarea.tsx`      | Hero `TextArea` (RAC textarea)                                                                                                                                                                                  | done   |
| `tooltip.tsx`       | Hero `Tooltip` (`TooltipProvider` only carries the default delay)                                                                                                                                               | done   |

## Task 4 notes (A-class adapters)

- Hero's --accent/--muted collision is resolved per component with explicit legacy utility classes (utilities layer beats Hero's components layer); the global tokens are untouched.
- Hero resets that leak into legacy metrics are neutralised in the wrapper classes: `.button` svg margins (`heroui-bridge.css`, same layer so call-site `ms-*` wins), `.button` `transform-gpu`/pressed scale, `.chip`/`.card__*` `--tw-leading` (`[--tw-leading:initial]`), Chip.Label padding (children wrapped in a fragment), Card `p-4`/Content flex.
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

## Task 6 notes (form, toast, calendar, OTP)

- App code no longer imports `sonner`; use `toast` / `Toaster` from `@/components/ui/sonner` (tests mock that path). Removed packages: `sonner`, `the Radix label package`. the Radix slot package remained only for `sidebar.tsx`.
- Hero toast has no `error`/`message`/`duration`; the facade maps them (default 5000ms like the old `<Toaster duration={5000}/>`).
- Regression coverage: `form-toast-calendar.test.tsx`.

## Task 7 notes (sidebar, collapsible, command)

- New `slot.tsx` (local Radix `Slot` replacement, extracted from `form.tsx`) is shared by `form`, `collapsible` and `sidebar`. Removed the Radix collapsible and slot packages.
- `.CollapsibleContent` keyframes / `--radix-collapsible-content-height` removed from `index.css`; `CollapsibleContent` animates itself (`grid-template-rows` transition, 200ms). Visual tests run with `animations: 'disabled'`.
- `command.tsx` no longer uses `cmdk` (it pulled several Radix packages in transitively); see Task 8 notes.
- Regression coverage: `sidebar-collapsible.test.tsx`.

## Task 8 notes (final sweep)

- `command.tsx` rewritten locally: `Command` holds search/active state, `CommandItem` filters itself (case-insensitive substring over `value` / text content / `keywords`) and registers as visible, `CommandEmpty` shows when none are visible, empty groups hide through `not-has-[[data-slot=command-item]]`, ArrowUp/Down/Home/End/Enter are handled on the root. Items keep `role=option`, the input `role=combobox`. Fuzzy ranking of the old lib is gone (no re-sorting by score).
- `config-drawer.tsx` uses a small local radiogroup (`role=radio` buttons with `data-state`, arrow keys, RTL-aware) instead of the Radix radio group.
- `direction-provider.tsx` no longer wraps a Radix provider (only the `dir` attribute on `<html>` matters).
- Radix icons replaced by lucide equivalents in data-table + feature forms (`DotsHorizontal`->`Ellipsis`, `Mixer`->`Settings2`, `Cross2`->`X`, `PlusCircled`->`CirclePlus`, `CaretSort`->`ChevronsUpDown`, `EyeNone`->`EyeOff`, `DoubleArrow*`->`ChevronsLeft/Right`). Glyph shapes differ slightly; Task 9 polishes pixels.
- Removed the `body[data-scroll-locked]` override from `index.css`; the legacy CLI config file is deleted.
- Removed packages: `cmdk` and the last direct Radix dependencies (direction, icons, radio-group). `package.json` has no Radix package. The lockfile still lists one transitive Radix package (avatar and its primitive/context helpers) that `@heroui/react` itself depends on; it is not imported by app code and cannot be dropped without patching HeroUI.
