# Hero UI 像素对齐迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `feat/heroui-parity` 分支交付与当前 shadcn/ui 版亮/暗一比一的 HeroUI v3 程序，零 shadcn/Radix 残留，且不以修改 HeroUI 源码为手段。

**Architecture:** 保留 `@/components/ui` 作为应用设计系统；内部用 `@heroui/react` + 项目 CSS 主题桥接（及独立库补缺口）重写。先采 Playwright 全页截图基线，再换栈，以截图 diff 为完成硬门槛。

**Tech Stack:** React 19、Vite 8、Tailwind CSS v4、HeroUI v3（`@heroui/react` + `@heroui/styles`）、Playwright Test（视觉）、现有 Vitest（单元）、TanStack Router/Table/Query、react-hook-form + zod。

**Spec:** `docs/superpowers/specs/2026-11-12-heroui-parity-design.md`

## Global Constraints

- 不得修改 `node_modules/@heroui/*` 或维护 HeroUI fork；定制仅限 Provider/无 Provider 官方 API、`classNames`/slots、项目 CSS 变量覆盖。
- 迁完后不得保留 `@radix-ui/*`、`components.json`、shadcn CLI 配置与仅服务于 shadcn 的依赖。
- `@/components/ui` 目录名保留；语义 CSS 变量（`--background` 等）可作为本项目 token 保留。
- 业务代码允许任意改动；优先仍从 `@/components/ui` 引用，避免 features 散落直连 `@heroui/react`。
- 视觉验收：Playwright 截图 diff；**light + dark** 均须通过；迁移期禁止用「更新基线」代替修样式。
- 固定视觉视口 `1280x720`；动画在截图时禁用；主题强制 light/dark，不用 system。
- 抗锯齿阈值：`maxDiffPixelRatio: 0.001`（0.1%），写死在 `playwright.config.ts`；不得为混过而放大。

## Review Focus

- 升级 HeroUI 小版本后主题变量名变化 → 期望：仅改项目 CSS 桥接仍能对齐，视觉套件失败即阻断。
- Dialog/Sheet 打开时页面滚动与焦点陷阱与现版不同 → 期望：交互可用且打开态截图对齐；不引入 Radix。
- 表格空态 / 长文本 / RTL（若 DirectionProvider 开启）→ 期望：布局不溢出，与基线同视口一致。
- Toast 与 Calendar 换库后 z-index、圆角、字号漂移 → 期望：包装层 token 对齐，抽样截图覆盖。
- CI 与本地字体子集不同导致假红 → 期望：视觉套件固定系统字体回退策略并在 README 片段说明。

---

## File Structure（锁定分解）

| 路径 | 职责 |
|---|---|
| `playwright.config.ts` | 视觉回归 runner：视口、截图阈值、webServer |
| `tests/visual/**/*.spec.ts` | 路由级 light/dark 截图用例 |
| `tests/visual/helpers.ts` | 主题 cookie、禁用动画、等待稳定 |
| `tests/visual/baselines/**` | 迁移前采集的 PNG 基线（由 Playwright 快照目录约定） |
| `src/styles/index.css` | 引入 `@heroui/styles` + 冻动画工具类 |
| `src/styles/theme.css` | 保留语义 token；追加 Hero 变量桥接 |
| `src/styles/heroui-bridge.css` | Hero → 本项目 token 映射（唯一桥接文件） |
| `src/context/theme-provider.tsx` | 同步 `class` 与 `data-theme` |
| `src/components/ui/*.tsx` | 全部重写为 Hero/本地/独立库适配 |
| `src/components/ui/MAPPING.md` | 组件映射表（实现时维护） |
| `package.json` | 加 Hero/视觉脚本；删 Radix/shadcn 残留依赖 |
| 删除 | `components.json` |

---

### Task 1: 创建分支并搭建 Playwright 视觉脚手架

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/visual/helpers.ts`
- Create: `tests/visual/smoke.spec.ts`（临时探活，Task 2 替换为完整套件）
- Modify: `package.json`（scripts + `@playwright/test` devDependency）

**Interfaces:**
- Consumes: 现有 `npm run dev`（Vite）、cookie 名 `vite-ui-theme`
- Produces: `setVisualTheme(page, 'light' \| 'dark')`、`prepareVisualPage(page)`、`npm run test:visual`

- [ ] **Step 1: 从 main 创建分支**

```bash
git checkout main
git pull
git checkout -b feat/heroui-parity
```

- [ ] **Step 2: 安装 Playwright Test（与现有 vitest browser 并存）**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 3: 写入 `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
      threshold: 0.1,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://127.0.0.1:4173',
    trace: 'off',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

- [ ] **Step 4: 写入 `tests/visual/helpers.ts`**

```ts
import { type Page, expect } from '@playwright/test'

export type VisualTheme = 'light' | 'dark'

export async function setVisualTheme(page: Page, theme: VisualTheme) {
  await page.context().addCookies([
    {
      name: 'vite-ui-theme',
      value: theme,
      domain: '127.0.0.1',
      path: '/',
    },
  ])
}

export async function prepareVisualPage(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  })
  await page.evaluate(() => document.fonts.ready)
}

export async function shot(page: Page, name: string) {
  await prepareVisualPage(page)
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
}
```

- [ ] **Step 5: 写入探活用例 `tests/visual/smoke.spec.ts`**

```ts
import { test } from '@playwright/test'
import { setVisualTheme, shot } from './helpers'

test('sign-in light smoke', async ({ page }) => {
  await setVisualTheme(page, 'light')
  await page.goto('/sign-in')
  await shot(page, 'smoke-sign-in-light')
})
```

- [ ] **Step 6: 添加 npm scripts**

在 `package.json` 的 `scripts` 中加入：

```json
"test:visual": "playwright test",
"test:visual:update": "playwright test --update-snapshots"
```

- [ ] **Step 7: 跑通一次（允许首次生成快照）**

```bash
npm run test:visual:update -- tests/visual/smoke.spec.ts
```

Expected: 通过并生成截图文件。

- [ ] **Step 8: Commit**

```bash
git add playwright.config.ts tests/visual package.json package-lock.json
git commit -m "test(visual): 添加 Playwright 视觉回归脚手架"
```

---

### Task 2: 采集迁移前亮/暗全量基线

**Files:**
- Create: `tests/visual/parity.spec.ts`
- Delete: `tests/visual/smoke.spec.ts`（并入 parity）
- Create/Update: Playwright 快照目录下各 PNG（由命令生成）

**Interfaces:**
- Consumes: `setVisualTheme`、`shot`、`prepareVisualPage`
- Produces: 锁定基线文件；后续任务不得默认 `--update-snapshots`

- [ ] **Step 1: 编写完整用例 `tests/visual/parity.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import { setVisualTheme, shot, prepareVisualPage, type VisualTheme } from './helpers'

const themes: VisualTheme[] = ['light', 'dark']

const routes: { name: string; path: string }[] = [
  { name: 'sign-in', path: '/sign-in' },
  { name: 'dashboard', path: '/' },
  { name: 'tasks', path: '/tasks' },
  { name: 'users', path: '/users' },
  { name: 'settings', path: '/settings' },
]

for (const theme of themes) {
  test.describe(`parity ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await setVisualTheme(page, theme)
    })

    for (const route of routes) {
      test(`${route.name}`, async ({ page }) => {
        await page.goto(route.path)
        await shot(page, `${route.name}-${theme}`)
      })
    }

    test('dialog-open', async ({ page }) => {
      await page.goto('/tasks')
      await prepareVisualPage(page)
      // 打开 Tasks 页「Create」类主按钮触发的 Dialog/Drawer；若文案变更，改用稳定 data-testid
      const trigger = page.getByRole('button').filter({ hasText: /create|add|new|创建|新增/i }).first()
      await trigger.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await shot(page, `tasks-dialog-${theme}`)
    })

    test('dropdown-open', async ({ page }) => {
      await page.goto('/tasks')
      await prepareVisualPage(page)
      // 行操作或视图菜单；实现时为触发器加 data-testid="visual-row-actions" 更稳
      const menuBtn = page.locator('[data-testid="visual-row-actions"]').first()
      if (await menuBtn.count()) {
        await menuBtn.click()
      } else {
        await page.getByRole('button', { name: /open menu|actions|更多/i }).first().click()
      }
      await page.waitForTimeout(100)
      await shot(page, `tasks-dropdown-${theme}`)
    })
  })
}
```

- [ ] **Step 2: 为稳定选择器补 `data-testid`（仍在 shadcn 代码上）**

在 Tasks 行操作按钮上增加 `data-testid="visual-row-actions"`（文件通常为 `src/features/tasks/components/data-table-row-actions.tsx`）。此改动极小，基线包含该属性不影响像素（testid 不渲染可见 UI）。

- [ ] **Step 3: 删除 smoke，生成全量基线**

```bash
Remove-Item tests/visual/smoke.spec.ts -ErrorAction SilentlyContinue
npm run test:visual:update
```

Expected: 全部用例通过；快照入库。

- [ ] **Step 4: 验证「对比模式」通过**

```bash
npm run test:visual
```

Expected: PASS（与刚写入基线一致）。

- [ ] **Step 5: Commit**

```bash
git add tests/visual src/features/tasks/components/data-table-row-actions.tsx
git commit -m "test(visual): 锁定 shadcn 基线亮暗全页截图"
```

---

### Task 3: 接入 HeroUI 与主题桥接（尚未替换业务组件）

**Files:**
- Modify: `package.json`
- Modify: `src/styles/index.css`
- Create: `src/styles/heroui-bridge.css`
- Modify: `src/context/theme-provider.tsx`
- Create: `src/components/ui/MAPPING.md`

**Interfaces:**
- Consumes: 现有 `theme.css` 语义变量
- Produces: Hero 样式可加载；`html` 同时具有 `class="light|dark"` 与 `data-theme="light|dark"`

- [ ] **Step 1: 安装 HeroUI v3**

```bash
npm install @heroui/react @heroui/styles
```

- [ ] **Step 2: 更新 `src/styles/index.css` 头部**

在现有 `@import 'tailwindcss';` 之后加入（顺序固定）：

```css
@import 'tailwindcss';
@import '@heroui/styles';
@import 'tw-animate-css';
@import './theme.css';
@import './heroui-bridge.css';
```

- [ ] **Step 3: 创建 `src/styles/heroui-bridge.css`**

将 Hero 默认强调色等映射到本项目 token。实现时对照 `@heroui/styles` 实际变量名微调；模式如下（禁止改 node_modules）：

```css
:root,
.light,
[data-theme='light'] {
  /* 示例：把 Hero accent 拉到本项目 primary；以安装后真实变量名为准 */
  --accent: var(--primary);
  --accent-foreground: var(--primary-foreground);
}

.dark,
[data-theme='dark'] {
  --accent: var(--primary);
  --accent-foreground: var(--primary-foreground);
}
```

保留 `theme.css` 中全部 `--background` / `--foreground` / `--radius` 等真源定义。

- [ ] **Step 4: ThemeProvider 同步 `data-theme`**

修改 `applyTheme`：

```ts
const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
  root.classList.remove('light', 'dark')
  root.classList.add(currentResolvedTheme)
  root.setAttribute('data-theme', currentResolvedTheme)
}
```

- [ ] **Step 5: 写入映射表骨架 `src/components/ui/MAPPING.md`**

列出每个 `ui/*.tsx` 文件、目标（Hero / 本地 / 独立库）、状态（pending）。

- [ ] **Step 6: 确认 build 仍通过（组件未换）**

```bash
npm run build
```

Expected: 成功。此时视觉可能因全局 CSS 引入 Hero 默认规则而**失败**——若失败，优先在 `heroui-bridge.css` 收敛全局影响，使 Task 2 基线在「仅接入 CSS、未换组件」时尽可能仍绿；若 Hero 全局样式不可避免改变像素，记录差异并在后续替换组件时一并打绿（不得更新基线语义）。

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/styles src/context/theme-provider.tsx src/components/ui/MAPPING.md
git commit -m "feat(heroui): 接入 HeroUI 样式与主题桥接"
```

---

### Task 4: 重写基础控件适配层（A 类）

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/label.tsx`
- Modify: `src/components/ui/checkbox.tsx`
- Modify: `src/components/ui/radio-group.tsx`
- Modify: `src/components/ui/switch.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/avatar.tsx`
- Modify: `src/components/ui/separator.tsx`
- Modify: `src/components/ui/skeleton.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: 所有因此 API 变更而失败的 Vitest / 调用方
- Update: `src/components/ui/MAPPING.md`

**Interfaces:**
- Consumes: `@heroui/react` 对应组件；`cn` from `@/lib/utils`
- Produces: 同名导出 `Button`、`Input` 等；**不再**依赖 `@radix-ui/react-slot` 的 `asChild`（调用方改为普通组合或 `render`/子组件模式）

- [ ] **Step 1: 写失败的契约测试（Button 尺寸）**

Create `src/components/ui/button.visual-contract.test.tsx`（Vitest browser）：

```tsx
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from './button'

describe('Button visual contract', () => {
  test('default size is 36px tall (h-9)', async () => {
    const screen = await render(<Button>Save</Button>)
    const el = screen.getByRole('button', { name: 'Save' })
    const box = el.element().getBoundingClientRect()
    expect(box.height).toBe(36)
  })
})
```

- [ ] **Step 2: 跑测试确认当前或重写中的失败/基线**

```bash
npm test -- src/components/ui/button.visual-contract.test.tsx
```

- [ ] **Step 3: 用 Hero Button 重写 `button.tsx`（示例模式，供本 Task 所有基础件复用）**

```tsx
import { Button as HeroButton } from '@heroui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('', {
  variants: {
    variant: {
      default: '',
      destructive: '',
      outline: '',
      secondary: '',
      ghost: '',
      link: '',
    },
    size: {
      default: 'h-9 px-4',
      sm: 'h-8 px-3',
      lg: 'h-10 px-6',
      icon: 'size-9 p-0',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

type Props = React.ComponentProps<typeof HeroButton> &
  VariantProps<typeof buttonVariants> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }

function mapVariant(v: Props['variant']) {
  switch (v) {
    case 'destructive':
      return 'danger'
    case 'secondary':
      return 'secondary'
    case 'outline':
      return 'bordered'
    case 'ghost':
      return 'ghost'
    case 'link':
      return 'ghost'
    default:
      return 'primary'
  }
}

function Button({ className, variant = 'default', size, ...props }: Props) {
  return (
    <HeroButton
      variant={mapVariant(variant)}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

实现时以 **截图 + 高度契约** 为准调整 `className`；Hero 的 `variant` 枚举若与文档不同，按安装版 `@heroui/react` 类型修正。

- [ ] **Step 4: 按同一模式重写本 Task 列表中其余基础控件**

每个文件：去掉 `@radix-ui/*` import；用 Hero 等价物；用 Tailwind 把高度/圆角/边框拉到与旧 class 一致（对照迁移前文件 git show）。

- [ ] **Step 5: 修复调用方**

全局搜索 `asChild`（Button/Slot 相关）并改为不依赖 Slot 的写法。跑：

```bash
npm test
npm run build
```

- [ ] **Step 6: 更新 MAPPING.md 状态为 done（本 Task 文件）**

- [ ] **Step 7: Commit**

```bash
git add src/components/ui src/features src/components package.json
git commit -m "feat(ui): 用 HeroUI 重写基础控件适配层"
```

---

### Task 5: 重写浮层与选择类（A/B 类）

**Files:**
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/alert-dialog.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/tooltip.tsx`
- Modify: `src/components/ui/dropdown-menu.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/scroll-area.tsx`
- Modify: 相关 features 调用方与测试
- Update: `MAPPING.md`

**Interfaces:**
- Consumes: Hero Modal/Popover/Dropdown/Select/Tabs 等
- Produces: 导出名称尽量保持 `Dialog`、`DialogContent`、`DropdownMenu`…；若 Hero 无 compound 同构，允许改为更少 compound 并批量改调用方

- [ ] **Step 1: 选 Dialog 写打开态行为测试**

在现有 `src/components/confirm-dialog.test.tsx` 上跑一遍；预期在替换后需更新 selectors。先跑记录失败：

```bash
npm test -- src/components/confirm-dialog.test.tsx
```

- [ ] **Step 2: 用 Hero Modal 重写 dialog 适配层**

模式：

```tsx
import { Modal } from '@heroui/react'
// 将 Dialog/DialogContent/DialogHeader/DialogFooter/DialogTitle/DialogDescription
// 映射为 Modal 的 compound 或薄包装；className 对齐旧 padding/圆角/max-width
```

对照旧 `dialog.tsx` 的 Tailwind（`sm:max-w-lg`、`p-6` 等）逐项搬到 wrapper。

- [ ] **Step 3: 依次替换本 Task 其余浮层组件**

顺序建议：`tooltip` → `popover` → `dropdown-menu` → `select` → `tabs` → `alert-dialog` → `sheet` → `scroll-area`。每完成 1–2 个文件跑相关测试。

- [ ] **Step 4: 去掉本 Task 相关 `@radix-ui/*` 依赖（若已无引用）**

```bash
npm uninstall @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-scroll-area
```

仅卸载确认零引用的包；残留的留给后续 Task。

- [ ] **Step 5: 跑单元测试与视觉（预期仍红，但 dialog/dropdown 用例应开始接近）**

```bash
npm test
npm run test:visual
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui src/features src/components package.json package-lock.json
git commit -m "feat(ui): 用 HeroUI 重写浮层与选择类组件"
```

---

### Task 6: Form、Toast、Calendar、OTP（B/C 类）

**Files:**
- Modify: `src/components/ui/form.tsx`
- Modify: `src/components/ui/sonner.tsx`（可改名为 toast 适配，但保持 `Toaster` 导出或同步改 `__root`）
- Modify: `src/components/ui/calendar.tsx`
- Modify: `src/components/ui/input-otp.tsx`
- Modify: `src/components/date-picker.tsx`
- Modify: `src/main.tsx` / `src/routes/__root.tsx` 中 Toaster 挂载
- Update: `MAPPING.md`

**Interfaces:**
- Consumes: RHF + zod；Hero 表单控件；独立 toast/calendar/otp 库（若 Hero Toast 不足）
- Produces: `Form*`、`Toaster`/`toast`、`Calendar`、`InputOTP` 可用且无 Radix Label/Slot

- [ ] **Step 1: Form — 去掉 Radix Label 依赖**

`form.tsx` 中 `Label` 改为 `@/components/ui/label`（已 Hero 化）。保持 `FormField`/`FormItem`/`FormControl`/`FormMessage` 模式，便于 settings/auth 表单少改。

- [ ] **Step 2: Toast 决策实现**

1. 尝试 `@heroui/react` Toast：在 `__root` 挂载官方 Provider/Toaster。  
2. 若 API 或样式无法对齐 sonner 用法，则 `npm install` 独立 toast 库，在 `sonner.tsx` 内适配，**导出**继续提供 `toast` 函数与 `<Toaster />`，并修改 `src/main.tsx` 中 `import { toast } from 'sonner'` 为 `@/components/ui/sonner`（或新路径）。  
3. 最后从 dependencies 移除 `sonner`（若不再直接使用）。

- [ ] **Step 3: Calendar**

保留 `react-day-picker`（或替换为同等独立库），`calendar.tsx` 去掉对旧 Button/Radix 的耦合，改用 Task 4 的 `Button`；样式 class 对齐旧版。

- [ ] **Step 4: InputOTP**

保留 `input-otp` 包或本地六格输入；样式对齐；OTP 页测试：

```bash
npm test -- src/features/auth/otp/components/otp-form.test.tsx
```

- [ ] **Step 5: 跑 auth/settings 相关测试**

```bash
npm test -- src/features/auth src/features/settings src/components
```

- [ ] **Step 6: Commit**

```bash
git add src package.json package-lock.json
git commit -m "feat(ui): 迁移 Form/Toast/Calendar/OTP 并去除 Radix 表单依赖"
```

---

### Task 7: Sidebar、Collapsible、Command（B 类本地拼装）

**Files:**
- Modify: `src/components/ui/sidebar.tsx`
- Modify: `src/components/ui/collapsible.tsx`
- Modify: `src/components/ui/command.tsx`
- Modify: `src/styles/index.css`（删除 `.CollapsibleContent` 的 `--radix-collapsible-content-height` 动画，改为纯 CSS grid/height 或 tw 动画）
- Modify: layout 组件若 API 变化
- Update: `MAPPING.md`

**Interfaces:**
- Consumes: Hero Button/ScrollShadow 等原语；本地 React state
- Produces: `SidebarProvider`、`Sidebar`、`SidebarInset`、`useSidebar` 等布局仍可编译

- [ ] **Step 1: Collapsible 去 Radix**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Collapsible({
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    setInternal(v)
    onOpenChange?.(v)
  }
  return (
    <div className={className} data-state={isOpen ? 'open' : 'closed'}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ isOpen?: boolean; setOpen?: (v: boolean) => void }>, {
              isOpen,
              setOpen,
            })
          : child
      )}
    </div>
  )
}
// 同步提供 CollapsibleTrigger / CollapsibleContent，用 CSS grid-template-rows 动画替代 radix 变量
```

按调用方实际 props 调整；以编译与侧栏交互为准。

- [ ] **Step 2: Command 去 cmdk（若视为 shadcn 生态残留）或保留 cmdk 作为独立库**

规格允许独立库：若 `cmdk` 无 Radix 硬依赖，可保留并只换样式；若要零 cmdk，用 Hero Input + Listbox 本地拼。**优先**：能对齐截图则保留 `cmdk` 作独立库并在 MAPPING 标注。

- [ ] **Step 3: Sidebar 重写**

在不引入 Radix 的前提下保留 cookie `sidebar_state`、`SidebarProvider` 行为；内部用本地 collapsible + 现有 layout class（`src/components/layout/*`）对齐。每次改完：

```bash
npm run build
```

- [ ] **Step 4: 视觉跑 dashboard/tasks（侧栏）**

```bash
npm run test:visual -- tests/visual/parity.spec.ts -g "dashboard|tasks"
```

按 diff 修 spacing/border。

- [ ] **Step 5: Commit**

```bash
git add src/components/ui src/styles src/components/layout
git commit -m "feat(ui): 本地拼装 Sidebar/Collapsible/Command 去除 Radix"
```

---

### Task 8: Table 与业务页收口 + 清除残留

**Files:**
- Modify: `src/components/ui/table.tsx`
- Modify: 任意仍 import Radix/shadcn 痕迹的 features
- Delete: `components.json`
- Modify: `package.json`（卸载全部剩余 `@radix-ui/*`、无用包）
- Modify: `src/styles/index.css`（删除 Radix scroll-lock hack 若不再需要）
- Update: `MAPPING.md` 全部 done

**Interfaces:**
- Consumes: Task 4–7 适配层
- Produces: `npm ls @radix-ui/react-dialog` 等为空；无 `components.json`

- [ ] **Step 1: Table 样式壳 Hero/本地化**

保持语义 HTML table + Tailwind；不强制 Hero Table 若像素更难对齐。

- [ ] **Step 2: 残留扫描（必须为 0）**

```bash
rg -n "radix-ui|shadcn|components\\.json|@radix-ui" --glob '!node_modules/**' --glob '!docs/**' --glob '!tests/visual/**'
```

Expected: 应用源码与 package.json dependencies 无匹配（docs/spec 提及允许）。

- [ ] **Step 3: 卸载剩余 Radix**

```bash
npm uninstall @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-direction @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch
```

（按 `package.json` 实际残留列表调整；先 `rg` 再卸。）

- [ ] **Step 4: 删除 `components.json`**

```bash
git rm components.json
```

- [ ] **Step 5: 全量单测 + build**

```bash
npm test
npm run build
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(ui): 清除 Radix/shadcn 残留并收口 Table 与业务调用"
```

---

### Task 9: 视觉回归打绿（DoD）

**Files:**
- Modify: 任意导致像素差的 `src/styles/heroui-bridge.css`、`src/components/ui/*`、layout/features className
- **禁止**默认修改基线 PNG

**Interfaces:**
- Consumes: Task 2 基线
- Produces: `npm run test:visual` 全绿

- [ ] **Step 1: 跑全量视觉**

```bash
npm run test:visual
```

记录失败用例名单。

- [ ] **Step 2: 按失败用例迭代**

顺序：全局色差（桥接）→ 基础控件高度 → 侧栏 → 表格 → dialog/dropdown。每修一类重跑对应 grep。

- [ ] **Step 3: 确认未使用更新基线混过**

```bash
git status tests/visual
```

Expected: 无基线 PNG 变更；若有，`git checkout --` 还原后继续修实现。

- [ ] **Step 4: DoD 清单命令**

```bash
npm run test:visual
npm test
npm run build
rg -n "@radix-ui|components\\.json" package.json src || true
```

Expected: 视觉/单测/build 通过；`src`+`package.json` 无 radix/components.json。

- [ ] **Step 5: 最终 Commit**

```bash
git add src package.json package-lock.json
git commit -m "fix(ui): 对齐 HeroUI 实现使亮暗视觉回归通过"
```

---

## Plan Self-Review

| Spec 要求 | 对应 Task |
|---|---|
| 独立分支 | Task 1 |
| 先基线后换栈 | Task 2 → 3+ |
| `@/components/ui` 适配层 | Task 4–7 |
| 零 shadcn/Radix 残留 | Task 8 |
| 不改 Hero 源码 | Global Constraints + Task 3 桥接 |
| 独立库补缺口 | Task 6–7 |
| 亮暗视觉硬门槛 | Task 2 + 9 |
| 业务可改 | Task 4–8 调用方步骤 |

占位符扫描：无 TBD/TODO。阈值与 cookie/视口已写死。
