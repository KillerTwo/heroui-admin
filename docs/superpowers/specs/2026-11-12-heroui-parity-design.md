# Hero UI 像素对齐迁移设计规格

**日期：** 2026-11-12  
**状态：** 已批准（对话确认）  
**分支（拟定）：** `feat/heroui-parity`  
**基线：** 当前 `main` 上的 shadcn/ui（new-york）版 shadcn-admin

## 1. 背景与目标

在单独分支交付一版基于 **HeroUI v3** 的程序，视觉与布局与当前 shadcn/ui 版本 **一比一像素对齐**（亮色 + 暗色）。开发过程中 **不得修改 HeroUI 源码**，以便后续通过 npm 正常升级。

### 1.1 已确认决策

| 项 | 决定 |
|---|---|
| 组件边界 | 保留 `@/components/ui` 作为应用设计系统适配层 |
| 业务代码 | 允许任意改动（不为 API 兼容牺牲实现） |
| 迁完残留 | 不得保留 shadcn/ui / Radix / `components.json` 等产品痕迹 |
| 缺口组件 | 优先用 Hero 原语本地拼装；无法实现时用独立库（toast、calendar 等） |
| 架构+流程 | 主题令牌对齐 + 适配层（方案 1）∪ 截图基线驱动（方案 3） |
| 验收 | Playwright 截图 diff 为硬门槛；亮色与暗色均须通过 |

### 1.2 成功标准

1. 视觉回归套件在 light / dark 下全部通过。  
2. 依赖与源码中无 shadcn CLI 配置、无 `@radix-ui/*`、无仅服务于 shadcn 的残留。  
3. 未修改 `node_modules` 内 HeroUI 源码，也未维护 HeroUI fork。  
4. `build` 与现有非视觉测试可通过（调用方 API 变更时同步更新测试）。

### 1.3 非目标（首版不做）

- 改变信息架构或业务功能。  
- 为贴近 Hero 官网而重做品牌视觉。  
- 完整移动端视口矩阵（可后续加，不挡首版 DoD）。  
- 立刻用本分支替换 `main`（合并策略另定）。

## 2. 架构

```
features / layout / routes
        ↓ 依赖本项目组件 API
src/components/ui/*          ← 应用设计系统（可改业务调用）
        ↓
HeroUI (@heroui/react)       ← 不改源码；theme / classNames / slots / 项目 CSS
  + 独立库（toast、calendar、otp 等缺口）
        ↓
主题令牌层（对齐现有 theme.css 视觉）
        ↓
视觉回归（Playwright 亮/暗截图硬门槛）
```

### 2.1 原则

1. 禁止 patch / fork HeroUI；定制只走官方主题能力、组件公开 API、外层 wrapper、项目 CSS。  
2. `@/components/ui` 目录名保留，作为本项目边界；**不算** shadcn 产品残留。其实现必须全部基于 HeroUI 或独立库。  
3. 语义化 CSS 变量（如 `--background`、`--primary`）作为本项目设计 token 保留，可通过桥接喂给 HeroUI。  
4. 技术选型锚定 **HeroUI v3**（`@heroui/react` + `@heroui/styles`），与现有 React 19 + Tailwind CSS v4 匹配。  
5. `main` 暂保持 shadcn 基线；Hero 版在独立分支交付。

### 2.2 分支策略

1. 从 `main` 创建 `feat/heroui-parity`（名称可微调）。  
2. 换栈前先在该分支采集视觉基线并入库。  
3. 再进行依赖替换与组件重写，用同一套用例把 diff 打绿。

## 3. 组件映射与缺口

业务层应优先通过 `@/components/ui` 引用组件，避免 features 大量直接散落 `@heroui/react`，便于主题与像素对齐收敛。具体 props 不必兼容 Radix。

### 3.1 A 类：HeroUI 可直接/近似覆盖（薄适配）

`button`、`input`、`textarea`、`label`、`checkbox`、`radio-group`、`switch`、`select`、`tabs`、`tooltip`、`popover`、`dialog`、`alert-dialog`、`dropdown-menu`、`avatar`、`badge`、`card`、`separator`、`skeleton`、`scroll-area`、`table`（样式壳；表格数据逻辑仍用 TanStack Table）

封装重点：用 `classNames` / slots / 尺寸 token 对齐现 new-york 的高度、圆角、边框、焦点环。

### 3.2 B 类：本地用 Hero 原语拼装

`sidebar`、`sheet`、`collapsible`、`command`（若无 cmdk 级对等则本地拼）、`form`（继续 react-hook-form + zod，控件换成 Hero）

要求：不引入 Radix；动画用项目 CSS / 现有动画方案，去掉对 `--radix-*` 变量的依赖。

### 3.3 C 类：独立库补齐

| 现组件 | 策略 |
|---|---|
| `sonner` / toast | 优先评估 Hero Toast；不足则用独立 toast 库，外层统一 API |
| `calendar` / date-picker | `react-day-picker` 或等价库 + 本地样式对齐 |
| `input-otp` | 独立 OTP 库或纯本地实现 |

选定库原则：可 npm 正常升级；样式由项目包一层；不 patch 库源码。

### 3.4 迁完必须消除的残留

- 依赖：全部 `@radix-ui/*`、`components.json`、仅服务于 shadcn 的包。  
- 代码：Radix scroll-lock hack、`--radix-*` 动画变量、shadcn 文档/CLI 痕迹。  
- 允许保留：`cn()`、CVA、语义 CSS 变量名、TanStack Table / Router / Query 等非 UI 库。

### 3.5 映射表

实现阶段维护「组件 → Hero / 本地拼装 / 独立库 → 视觉备注」清单；映射表缺项不得宣称完成。清单可附于本 spec 或同目录附录，随 PR 更新。

## 4. 主题令牌与像素对齐

### 4.1 视觉真源

以现有 `src/styles/theme.css` 的 light / `.dark` 语义变量与 `--radius` 等为视觉真源（含 sidebar、chart token）。

### 4.2 桥接 HeroUI

1. 引入 `@heroui/styles` 后，在项目 CSS 中将 Hero 主题变量映射/覆盖到上述 token（仅用官方支持的 CSS 变量覆盖）。  
2. 组件级差异通过 wrapper 的 `classNames` / slots / 显式工具类对齐。  
3. 禁止修改 `node_modules/@heroui/*`。

### 4.3 主题切换

- 应用继续控制 `html` 的 light/dark，并与 Hero 所需的 `data-theme`（若使用）保持同步。  
- 视觉回归强制 `light` 与 `dark`，不使用 `system`。

### 4.4 对齐层次

1. 全局色板与 radius  
2. 基础控件尺寸  
3. 复合件（Dialog、Dropdown、Sidebar、Table）  
4. 页面级间距与排版  

每一层以截图 diff 为准。

### 4.5 明确不做

- 不为「更像 Hero 默认皮肤」改品牌色或布局结构。  
- 不为对齐去改 Hero 源码；映射不了则走第 3 节 B/C 路径。

## 5. 视觉回归（硬门槛）

### 5.1 流程

1. 建分支后、换 UI 栈前，对关键路由采集 light/dark 截图，写入仓库（建议路径：`tests/visual/baselines/**`）。  
2. 替换为 HeroUI 实现。  
3. 同一用例对比基线；全绿才算完成。

基线来自迁移前同分支快照，保证对比对象一致。

### 5.2 首版必过场景

每个场景各跑 light + dark：

- 已登录布局壳（sidebar 展开；若折叠态可稳定复现则另采）  
- Dashboard、Tasks 列表、Users 列表  
- Settings 代表页一页  
- Auth 登录页  
- 叠加层抽样：至少 1 个 Dialog 打开态 + 1 个 Dropdown 打开态  

固定视口（建议 1280×720）。

### 5.3 稳定性

- 禁用或冻结动画/过渡。  
- 固定主题；对时间与随机数据打桩。  
- CI 与本地统一字体策略。  
- 允许文档化的**极小**抗锯齿阈值；禁止靠放大阈值混过。

### 5.4 命令约定

- `test:visual`：对比（失败即未完成）。  
- `test:visual:update`：仅在有意更新基线时使用；迁移期默认用修样式对齐旧基线，而非改基线。

### 5.5 完成定义（DoD）

同时满足：

1. 视觉回归 light + dark 全过。  
2. 无 shadcn/Radix/`components.json` 残留。  
3. 未修改 HeroUI 源码。  
4. `build` + 现有非视觉测试通过（含因 API 变更而更新的测试）。

## 6. 迁移顺序

1. 创建分支 → 视觉用例骨架 → **采集基线并入库**（仍为 shadcn）。  
2. 接入 HeroUI 与主题桥接；壳层可强制切亮/暗。  
3. 自底向上替换 `@/components/ui`：基础控件 → 浮层 → Form → Sidebar/布局 → 表格与业务页。  
4. 缺口走本地拼装或独立库。  
5. 删除 Radix/shadcn 残留；调整业务调用。  
6. 视觉 diff 打绿 → build + 单测通过。

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| Hero 默认皮肤与现版差一截 | token 桥接 + classNames；以截图迭代 |
| 浮层/焦点/滚动锁定行为不同 | 允许改业务；本地拼装；不引入 Radix |
| 动画/字体导致假红 | 冻动画、固定视口/主题/数据、文档化阈值 |
| 误用「更新基线」掩盖偏差 | 规范：迁移期禁止用更新基线代替修样式 |
| 升级 Hero 破坏对齐 | 不碰源码；升级后重跑视觉套件 |

## 8. 测试策略（除视觉外）

- 保留并迁移现有 Vitest 组件/逻辑测试；UI 交互断言随新 API 更新。  
- 视觉套件为发布/完成门禁，与单元测试分离命令，便于本地按需运行。

## 9. 后续步骤

1. 本规格经仓库内审阅确认后，使用 writing-plans 产出分步实现计划。  
2. 按计划在 `feat/heroui-parity` 执行；以第 5.5 节 DoD 验收。
