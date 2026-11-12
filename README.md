# Shadcn Admin Dashboard

Admin Dashboard UI crafted with Shadcn and Vite. Built with responsiveness and accessibility in mind.

![alt text](public/images/shadcn-admin.png)

[![Sponsored by Clerk](https://img.shields.io/badge/Sponsored%20by-Clerk-5b6ee1?logo=clerk)](https://go.clerk.com/GttUAaK)

I've been creating dashboard UIs at work and for my personal projects. I always wanted to make a reusable collection of dashboard UI for future projects; and here it is now. While I've created a few custom components, some of the code is directly adapted from ShadcnUI examples.

> This is not a starter project (template) though. I'll probably make one in the future.

## Features

- Light/dark mode
- Responsive
- Accessible
- With built-in Sidebar component
- Global search command
- 10+ pages
- Extra custom components
- RTL support

<details>
<summary>UI components (click to expand)</summary>

The components in `src/components/ui/` are thin adapters over [HeroUI v3](https://heroui.com) (React Aria + Tailwind) that keep the original API and look. A few are project-owned (`command`, `collapsible`, `sidebar`, `table`, `scroll-area`, `slot`). See `src/components/ui/MAPPING.md` for the per-component mapping and notes.

</details>

## Tech Stack

**UI:** [HeroUI v3](https://heroui.com) (TailwindCSS + React Aria)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons) (Brand icons only)

**Auth (partial):** [Clerk](https://go.clerk.com/GttUAaK)

## Run Locally

Clone the project

```bash
  git clone https://github.com/satnaing/shadcn-admin.git
```

Go to the project directory

```bash
  cd shadcn-admin
```

Install dependencies

```bash
  pnpm install
```

Start the server

```bash
  pnpm run dev
```

## Sponsoring this project ❤️

If you find this project helpful or use this in your own work, consider [sponsoring me](https://github.com/sponsors/satnaing) to support development and maintenance. You can [buy me a coffee](https://buymeacoffee.com/satnaing) as well. Don’t worry, every penny helps. Thank you! 🙏

For questions or sponsorship inquiries, feel free to reach out at [satnaingdev@gmail.com](mailto:satnaingdev@gmail.com).

### Current Sponsor

- [Clerk](https://go.clerk.com/GttUAaK) - authentication and user management for the modern web

## Author

Crafted with 🤍 by [@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
