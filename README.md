# HeroUI Admin Dashboard

Admin Dashboard UI built with [HeroUI v3](https://heroui.com), React, and Vite. Responsive and accessible by default.

![Dashboard preview](public/images/shadcn-admin.png)

This project started from [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) and was migrated to HeroUI while keeping the same layout and visual design. The previous Shadcn/UI version lives on the `feat/shadcn-parity` branch.

## Features

- Light/dark mode
- Responsive
- Accessible
- Built-in Sidebar
- Global search command
- 10+ pages
- Extra custom components
- RTL support
- Playwright visual regression (light + dark)

<details>
<summary>UI components (click to expand)</summary>

Components under `src/components/ui/` are thin adapters over [HeroUI v3](https://heroui.com) (React Aria + Tailwind) that preserve the app’s original API and look. A few are project-owned (`command`, `collapsible`, `sidebar`, `table`, `scroll-area`, `slot`). See `src/components/ui/MAPPING.md` for the per-component mapping.

</details>

## Tech Stack

**UI:** [HeroUI v3](https://heroui.com) (Tailwind CSS + React Aria)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons) (brand icons only)

**Auth (partial):** [Clerk](https://clerk.com)

## Run Locally

Clone the project

```bash
git clone https://github.com/KillerTwo/heroui-admin.git
```

Go to the project directory

```bash
cd heroui-admin
```

Install dependencies

```bash
pnpm install
```

Start the server

```bash
pnpm run dev
```

## Branches

| Branch | Description |
| --- | --- |
| `main` | HeroUI version (default) |
| `feat/shadcn-parity` | Original Shadcn/UI version |

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)

Upstream credit: originally crafted by [@satnaing](https://github.com/satnaing).
