# DESIGN.md — 公司账号资产管理系统 V1

> 设计系统：Linear（基底）× 定制蓝灰令牌
> 版本：v1.0 · Phase 1

---

## 1. Visual Theme

**Philosophy**: 极简功能主义 × 数据精准 — 用克制的蓝灰层次承载密集信息，让表格成为页面的视觉中心而非装饰。

**Direction**: Tech Utility（技术工具感）主导 + Modern Minimal（现代极简）辅助 — 数据密集、功能优先、清晰信息层级。专业、可信、安全。

**Personality**: 专业、高效、安全、克制 — 不喧宾夺主，让用户聚焦于账号资产数据本身。

**Reference**: Linear Dashboard 的极简功能主义 + 蓝灰专业色系处理 + 右侧详情面板交互范式

**Tone Keywords**: 专业 · 高效 · 克制 · 可信 · 数据驱动

---

## 2. Color Palette

### 2.1 Background System（背景系统）

| Token | HEX | OKLCh | Usage |
|-------|-----|-------|-------|
| `--color-bg-primary` | `#F7F8FA` | oklch(97% 0.005 260) | 页面主背景 |
| `--color-bg-secondary` | `#F0F1F3` | oklch(95% 0.005 260) | 侧栏/区域背景 |
| `--color-surface` | `#FFFFFF` | oklch(100% 0 0) | 卡片/表格表面背景 |
| `--color-surface-hover` | `#F3F4F6` | oklch(96% 0.004 260) | 卡片悬浮态 |
| `--color-surface-elevated` | `#FFFFFF` | oklch(100% 0 0) | 模态框/弹窗背景 |

### 2.2 Primary Blue（主色系 — Linear 蓝灰风）

| Token | HEX | OKLCh | Usage |
|-------|-----|-------|-------|
| `--color-primary` | `#2B6CB0` | oklch(48% 0.13 260) | 主品牌色，CTA按钮 |
| `--color-primary-hover` | `#1A4F8A` | oklch(40% 0.13 260) | Hover 态 |
| `--color-primary-active` | `#0F3A6B` | oklch(32% 0.13 260) | Active/按下态 |
| `--color-primary-subtle` | `#EBF1FA` | oklch(94% 0.025 260) | 极淡蓝色背景 |
| `--color-primary-muted` | `rgba(43, 108, 176, 0.12)` | — | 蓝色遮罩/发光 |

### 2.3 Neutral Gray（中性灰 — Linear 标志性灰度体系）

| Token | HEX | OKLCh | Usage |
|-------|-----|-------|-------|
| `--color-gray-50` | `#F9FAFB` | oklch(98% 0.002 260) | 极浅灰背景 |
| `--color-gray-100` | `#F3F4F6` | oklch(96% 0.004 260) | 表头背景/悬浮 |
| `--color-gray-200` | `#E5E7EB` | oklch(93% 0.006 260) | 边框/分割线 |
| `--color-gray-300` | `#D1D5DB` | oklch(87% 0.01 260) | 强调边框 |
| `--color-gray-400` | `#9CA3AF` | oklch(71% 0.02 260) | 禁用文字/占位符 |
| `--color-gray-500` | `#6B7280` | oklch(55% 0.025 260) | 次要文本 |
| `--color-gray-600` | `#4B5563` | oklch(42% 0.03 260) | 正文默认文本 |
| `--color-gray-700` | `#374151` | oklch(32% 0.03 260) | 标题文本 |
| `--color-gray-800` | `#1F2937` | oklch(24% 0.03 260) | 大标题文本 |
| `--color-gray-900` | `#111827` | oklch(16% 0.03 260) | 品牌/强调文本 |

### 2.4 Semantic Colors（语义色系统）

| Token | HEX | OKLCh | Usage | 业务映射 |
|-------|-----|-------|-------|---------|
| `--color-danger` | `#DC2626` | oklch(50% 0.22 30) | 高风险/错误状态 | 高风险账号、严重违规 |
| `--color-danger-bg` | `#FEF2F2` | oklch(96% 0.025 30) | 高风险背景态 | 高风险标签背景 |
| `--color-warning` | `#D97706` | oklch(60% 0.16 75) | 中风险/待处理 | 中风险账号、即将过期 |
| `--color-warning-bg` | `#FFFBEB` | oklch(97% 0.03 85) | 中风险背景态 | 中风险标签背景 |
| `--color-success` | `#059669` | oklch(52% 0.15 160) | 正常/使用中 | 正常状态、活跃账号 |
| `--color-success-bg` | `#ECFDF5` | oklch(96% 0.025 160) | 正常背景态 | 正常标签背景 |
| `--color-idle` | `#9CA3AF` | oklch(71% 0.02 260) | 闲置/已注销 | 闲置账号、停用状态 |
| `--color-idle-bg` | `#F3F4F6` | oklch(96% 0.004 260) | 闲置背景态 | 闲置标签背景 |
| `--color-info` | `#2563EB` | oklch(48% 0.15 260) | 信息提示 | 提示、通知 |
| `--color-info-bg` | `#EFF6FF` | oklch(95% 0.03 260) | 信息背景态 | 提示标签背景 |

### 2.5 Masked Field（脱敏字段专用色）

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-masked-bg` | `#F3F4F6` | 脱敏字段背景色 |
| `--color-masked-text` | `#9CA3AF` | 脱敏占位占位符颜色（••••••） |
| `--color-masked-border` | `#E5E7EB` | 脱敏字段边框 |
| `--color-revealed-indicator` | `#DC2626` | "已记录日志"指示图标色 |

### 2.6 Text Colors（文本色）

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#1F2937` | 主要文本/标题 |
| `--color-text-secondary` | `#6B7280` | 次要文本/说明 |
| `--color-text-tertiary` | `#9CA3AF` | 禁用/占位符 |
| `--color-text-on-primary` | `#FFFFFF` | 主色背景上的文本 |
| `--color-text-link` | `#2B6CB0` | 链接文本 |

### 2.7 Border & Divider（边框与分割线）

| Token | HEX | Usage |
|-------|-----|-------|
| `--color-border` | `#E5E7EB` | 默认边框 |
| `--color-border-strong` | `#D1D5DB` | 强调边框 |
| `--color-divider` | `#F0F1F3` | 表格行分割线 |

---

## 3. Typography

### 3.1 Font Stacks

| 层级 | Font Stack |
|------|-----------|
| **Heading** | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| **Body** | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| **Numeric/Mono** | `'JetBrains Mono', 'SF Mono', 'Fira Code', 'Menlo', monospace` |

### 3.2 Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **H1** | 24px / 1.5rem | 700 | 1.3 | -0.01em | 页面大标题 |
| **H2** | 20px / 1.25rem | 600 | 1.4 | -0.005em | 页面标题/模块标题 |
| **H3** | 18px / 1.125rem | 600 | 1.4 | 0 | 卡片标题/面板标题 |
| **H4** | 16px / 1rem | 600 | 1.5 | 0 | 小标题/分组标题 |
| **Body** | 14px / 0.875rem | 400 | 1.5 | 0 | 表格内容/正文 |
| **Body-Small** | 13px / 0.8125rem | 400 | 1.4 | 0 | 数据密集表格/小标签 |
| **Small** | 12px / 0.75rem | 400 | 1.5 | 0.01em | 辅助文字/时间/元信息 |
| **Micro** | 11px / 0.6875rem | 500 | 1.4 | 0.02em | Badge/Badge 数字 |
| **Metric** | 28px / 1.75rem | 700 | 1.1 | -0.02em | KPI 大数字指标 |

### 3.3 Font Weight Usage

- **400 Regular**: 正文、表格内容、说明文字
- **500 Medium**: 表格表头、标签文字、按钮文字（次要）
- **600 SemiBold**: 子标题、导航项、卡片标题、按钮文字（主要）
- **700 Bold**: 主标题、KPI 大数字

### 3.4 Data Table Typography（数据表格排版特殊规则）

| 场景 | 字号 | 字重 | 备注 |
|------|------|------|------|
| 表头 | 12px | 500 | 字母大写（UPPERCASE） |
| 普通单元格 | 14px | 400 | 行高 48px 时用 |
| 密集单元格 | 13px | 400 | 行高 40px 时用 |
| 脱敏占位符 | 14px | 400 | 颜色 `--color-masked-text` |
| 操作按钮 | 13px | 500 | 蓝色链接样式 |
| 多选勾选框标签 | 14px | 400 | 跟随行文本 |

---

## 4. Component Styles

### 4.1 Navigation Sidebar（左侧导航）

| 属性 | 值 |
|------|-----|
| 宽度 | 228px（展开）/ 64px（折叠） |
| 背景 | `var(--color-bg-secondary)` |
| 顶部品牌区高度 | 56px |
| 导航项高度 | 40px |
| 导航项圆角 | 6px |
| 导航项内边距 | 8px 12px |
| 导航项 Hover | `var(--color-surface-hover)` |
| 导航项 Active | `var(--color-primary-subtle)` + 左侧 3px `var(--color-primary)` 竖条 |
| 图标色（默认） | `var(--color-gray-400)` |
| 图标色（Active） | `var(--color-primary)` |
| 文本色（默认） | `var(--color-text-secondary)` |
| 文本色（Active） | `var(--color-primary)` |
| 禁用项样式 | `opacity: 0.4; cursor: not-allowed;` |
| 禁用项标记 | 项右侧灰色标签 "即将上线" |

**禁用菜单项样式**：
```
┌─────────────────────────┐
│  📋 操作日志            │  ← 正常项
├─────────────────────────┤
│  🔄 数据同步    [即将上线] │  ← 禁用项，40%不透明度
│                         │    文字灰、图标灰
└─────────────────────────┘
```

### 4.2 Top Header Bar（顶部 Header）

| 属性 | 值 |
|------|-----|
| 高度 | 52px |
| 背景 | `var(--color-surface)` |
| 底部边框 | `1px solid var(--color-border)` |
| 内边距 | 0 24px |
| 布局 | 左：面包屑导航 / 右：用户信息 + 退出按钮 |
| 固定 | `position: sticky; top: 0; z-index: 100` |

### 4.3 Global Search（全局搜索框）

| 属性 | 值 |
|------|-----|
| 容器位置 | 顶部 Header 下方 / 页面顶部区域 |
| 宽度 | 100%（最大 480px） |
| 高度 | 36px |
| 内边距 | 8px 12px 8px 36px |
| 圆角 | 6px |
| 边框 | `1px solid var(--color-border)` |
| 背景 | `var(--color-surface)` |
| 搜索图标 | 左侧 14px 处，`var(--color-gray-400)` |
| Focus 态 | 边框 `var(--color-primary)`，`box-shadow: 0 0 0 3px var(--color-primary-muted)` |
| 占位符 | "搜索账号、平台、责任人..." |
| 防抖 | **300ms** debounce |
| 清空按钮 | 右侧显示（输入内容时） |

### 4.4 KPI Indicator Bar（KPI 辅助条）

```
┌──────────────────────────────────────────────────────────────────────┐
│  账号总数   使用中    闲置    高风险    无负责人                       │
│  ┌──────┐  ┌──────┐  ┌────┐  ┌──────┐  ┌──────┐                    │
│  │ 1,284 │  │ 892  │  │ 156│  │  38  │  │  72  │                    │
│  │ 总资产 │  │ 65%  │  │ 12%│  │ 2.9% │  │ 5.6% │                    │
│  └──────┘  └──────┘  └────┘  └──────┘  └──────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| 卡片背景 | `var(--color-surface)` |
| 卡片圆角 | 8px |
| 卡片内边距 | 16px 20px |
| 卡片间距 | 12px |
| 指标数字 | 28px, 700, `var(--color-text-primary)` |
| 指标标签 | 12px, 400, `var(--color-text-secondary)` |
| 指标趋势色 | 上涨 `var(--color-success)` / 下降 `var(--color-danger)` |
| 选中态 | 左侧 3px 色条（蓝色=总数，绿色=使用中，灰色=闲置，红色=高风险，橙色=无负责人） |
| 交互 | 可点击作为快捷筛选（选中后对应表格筛选） |

### 4.5 View Tabs（视图切换 Tabs）

| 属性 | 值 |
|------|-----|
| 容器 | 水平排列，底部无边框 |
| Tab 高度 | 36px |
| Tab 内边距 | 0 16px |
| Tab 字重 | 500 |
| Tab 字号 | 14px |
| Tab 默认色 | `var(--color-text-secondary)` |
| Tab Hover 色 | `var(--color-text-primary)` |
| Tab Active | 底部 2px `var(--color-primary)` + 文字色 `var(--color-text-primary)` |
| 间隔 | 各 tab 之间无分割线 |

### 4.6 Filter Bar（多条件筛选栏）

| 属性 | 值 |
|------|-----|
| 容器背景 | `var(--color-bg-primary)` |
| 内边距 | 12px 0 |
| 筛选器类型 | 下拉式 Select + 标签式快速筛选 |
| 标签高度 | 32px |
| 标签圆角 | 16px（pill 样式） |
| 标签默认态 | 背景 `var(--color-gray-100)`，文字 `var(--color-text-secondary)` |
| 标签选中态 | 背景 `var(--color-primary)`，文字 `#FFFFFF` |
| 筛选项间距 | 8px |

**筛选维度**（6 个）：
| 序号 | 维度 | 筛选类型 | 选项 |
|:---:|------|---------|------|
| 1 | 状态 | 标签切换 | 全部 / 使用中 / 闲置 / 已注销 |
| 2 | 平台 | 下拉多选 | 飞书 / 微信 / 阿里云 / 抖音 / ... |
| 3 | 责任人 | 下拉搜索 | 组织架构选择 |
| 4 | 风险等级 | 标签切换 | 全部 / 高风险 / 中风险 / 正常 |
| 5 | 最近活跃 | 下拉选择 | 7天内 / 30天内 / 90天内 / 更早 |
| 6 | 标签 | 下拉多选 | 自定义标签 |

### 4.7 Batch Action Bar（批量操作栏）

| 属性 | 值 |
|------|-----|
| 显示条件 | ≥1 行选中时显示 |
| 位置 | 筛选栏下方，表格上方 |
| 背景 | `var(--color-primary-subtle)` |
| 高度 | 44px |
| 内边距 | 8px 16px |
| 圆角 | 8px |
| 选中计数 | 左侧显示 "已选择 N 项"（N 带 `var(--color-primary)` 色 badge） |

**批量操作按钮**（4 种）：
| 操作 | 按钮类型 | 确认要求 |
|------|---------|---------|
| 批量转交 | Secondary 按钮 | 弹窗选择接收人 |
| 批量打标签 | Secondary 按钮 | 弹窗选择标签 |
| 批量启用/禁用 | Danger ghost 按钮 | 二次确认弹窗 |
| 批量导出 | Secondary 按钮 | 直接触发下载 |

### 4.8 Data Table（数据表格 — 核心组件）

| 属性 | 值 |
|------|-----|
| 容器背景 | `var(--color-surface)` |
| 容器圆角 | 8px |
| 边框 | `1px solid var(--color-border)` |
| 表头背景 | `var(--color-gray-50)` |
| 表头文本 | 12px, 500, UPPERCASE, `var(--color-text-secondary)` |
| 表头高度 | 40px |
| 行高 | 48px（标准）/ 56px（宽松）/ 40px（密集） |
| 行背景 | `var(--color-surface)` |
| 行 Hover | `var(--color-surface-hover)` |
| 行分割 | `1px solid var(--color-divider)` 水平线（无斑马纹） |
| **首列固定** | `position: sticky; left: 0; z-index: 2` |
| **表头固定** | `position: sticky; top: 0; z-index: 3` |
| 横向滚动 | `overflow-x: auto` |
| 多选勾选框 | 首列固定区域内第一列，18×18px |

**14 字段列定义**：
| # | 字段 | 宽度 | 对齐 | 特殊处理 |
|:-:|------|------|:----:|---------|
| 1 | 多选框 | 40px | 中 | 勾选框 |
| 2 | 账号名 | 160px | 左 | 锚点文字（点击打开详情面板） |
| 3 | 平台 | 120px | 左 | 平台图标+名称 |
| 4 | 所属部门 | 140px | 左 | — |
| 5 | 责任人 | 120px | 左 | 头像+姓名 |
| 6 | 状态 | 100px | 中 | Badge（使用中/闲置/已注销） |
| 7 | 风险等级 | 100px | 中 | 色标 Badge |
| 8 | 最近活跃 | 120px | 右 | 相对时间 |
| 9 | 创建时间 | 140px | 右 | 日期格式 |
| 10 | 过期时间 | 140px | 右 | 日期格式 |
| 11 | 敏感信息 | 140px | 中 | 脱敏字段（见 4.12） |
| 12 | 标签 | 160px | 左 | Tag 组（最多3个） |
| 13 | 最后操作人 | 120px | 左 | — |
| 14 | 操作 | 120px | 中 | 操作按钮组 |

### 4.9 Right Detail Panel（右侧详情面板）

| 属性 | 值 |
|------|-----|
| 宽度 | 520px（默认）/ 560px（含审计日志展开） |
| 背景 | `var(--color-surface)` |
| 左边框 | `1px solid var(--color-border)` |
| 阴影 | `var(--shadow-xl)` |
| 内边距 | 24px |
| 标题区高度 | 56px（标题 + 关闭按钮） |
| 动画 | `transform: translateX(0)` 从右侧滑入，300ms ease |
| 遮罩层 | `rgba(0, 0, 0, 0.3)`, 点击遮罩关闭 |
| ESC 关闭 | 支持 |

**面板内容区块**（9 区）：
| 区块 | 标题 | 高度 |
|:----:|------|:----:|
| 1 | 基本信息 | 自适应 |
| 2 | 权限信息 | 自适应 |
| 3 | 责任人信息 | 自适应 |
| 4 | 安全设置 | 自适应 |
| 5 | 关联账号 | 自适应 |
| 6 | 操作日志（最近） | 自适应（最多5条） |
| 7 | 标签 | 自适应 |
| 8 | 备注 | 自适应 |
| 9 | 操作按钮区 | 56px（底部固定） |

### 4.10 Modal Dialog（居中模态弹窗）

| 属性 | 值 |
|------|-----|
| 宽度 | 640px（标准）/ 800px（导入预览） |
| 背景 | `var(--color-surface-elevated)` |
| 圆角 | 12px |
| 内边距 | 24px |
| 遮罩 | `rgba(0, 0, 0, 0.4)`；`backdrop-filter: blur(2px)` |
| 动画 | `opacity + transform: scale(0.97→1)`，200ms ease |
| 标题 | 18px, 600, 底部 `1px solid var(--color-divider)` |
| 底部操作栏 | 56px，右对齐（取消 + 确认按钮） |

**弹窗表单布局**（5 必填 + 15 非必填）：
```
┌──────────────────────────────────────────────────────────┐
│  新增账号                                       [✕]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ 基本信息 ─────────────────────────────────────────┐  │
│  │  账号名 *    [_____________________________]       │  │
│  │  平台 *      [下拉选择 v]                          │  │
│  │  所属部门 *  [下拉选择 v]                          │  │
│  │  责任人 *    [搜索选择________________]             │  │
│  │  状态 *      [● 使用中]  [○ 闲置]  [○ 已注销]     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ 安全信息 ─────────────────────────────────────────┐  │
│  │  密码        [_____________________________] [🔒]  │  │
│  │  手机号      [_____________________________]       │  │
│  │  邮箱        [_____________________________]       │  │
│  │  MFA 绑定    [是] [否]                             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ...（更多分组）                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                    [取消]    [保存]      │
└──────────────────────────────────────────────────────────┘
```

### 4.11 KPI Cards（指标卡片）

| 属性 | 值 |
|------|-----|
| 背景 | `var(--color-surface)` |
| 圆角 | 8px |
| 边框 | `1px solid var(--color-border)` |
| 内边距 | 16px 20px |
| 高度 | 80px |
| 最小宽度 | 160px |
| 布局 | 左侧色条（4px 宽） + 数字 + 标签 + 百分比 |
| 色条色 | 对应语义色或主题色 |
| 交互 | 可点击（作为快捷筛选入口） |

### 4.12 Masked Field（敏感信息脱敏字段）

```
┌──────────────────────────────────────────┐
│  ﹒﹒﹒﹒﹒﹒﹒﹒﹒﹒    [👁 查看] [📋 复制]   │
│  (浅灰背景, 占位样式)                     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  admin@company.com      [📋 复制]  📝    │
│  (明文显示, 正常样式)   (已记录日志图标)   │
└──────────────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| 脱敏背景 | `var(--color-masked-bg)` |
| 脱敏文字 | `var(--color-masked-text)`，使用 `•` 字符填充 |
| 脱敏圆角 | 4px |
| 脱敏内边距 | 4px 8px |
| 查看按钮 | Ghost 按钮，14px，蓝色 |
| 复制按钮 | Ghost 按钮，14px，蓝色 |
| 日志记录图标 | 查看/复制后显示 ✅ 带 tooltip "已记录日志" |
| 明文超时 | **30 秒**后自动恢复脱敏 |
| 权限提示 | 无权限时隐藏操作按钮，hover 显示 tooltip "暂无权限查看敏感信息" |

### 4.13 Pagination（分页组件）

| 属性 | 值 |
|------|-----|
| 位置 | 表格底部 |
| 内边距 | 16px 0 |
| 默认条数 | 50 条/页 |
| 可选项 | 20 / 50 / 100 |
| 布局 | 左：总数显示 "共 1,284 条" / 中：页码 / 右：跳转 |
| 页码按钮 | 28×28px，圆角 4px |
| 当前页码 | `var(--color-primary)` 背景 |
| 禁用态 | `opacity: 0.35` |

### 4.14 Pagination（分页组件布局）

```
左区:   共 1,284 条            中区:  [<] [1] [2] [3] [4] [5] ... [42] [>]
右区:   50 条/页 [v]    跳至 [___] 页
```

### 4.15 Permission-Aware UI（角色感知 UI）

| 元素 | 无权限行为 |
|------|-----------|
| 按钮 | `disabled` + `cursor: not-allowed` |
| Tooltip | "暂无权限"（鼠标悬浮时显示） |
| 菜单项 | 隐藏（默认）/ 置灰+tooltip（部分场景） |
| 表格行 | 行可读但操作列按钮禁用 |
| 详情面板区块 | 无权限的区块隐藏 |
| 敏感信息字段 | 操作按钮隐藏 |
| 页面级别 | 路由守卫 + 未授权页 |

### 4.16 Toast / Notification（操作反馈）

| 属性 | 值 |
|------|-----|
| 位置 | 页面顶部居中 |
| 圆角 | 8px |
| 内边距 | 10px 16px |
| 显示时长 | 3 秒（自动消失） |
| 类型色 | 成功 `var(--color-success)` / 错误 `var(--color-danger)` / 警告 `var(--color-warning)` / 信息 `var(--color-info)` |
| 图标 | 左侧类型图标 |

---

## 5. Layout

### 5.1 Overall Layout（三栏布局）

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   顶栏 Header (52px)                           │  │
│  │  面包屑 > 账号资产                                      👤 退出 │  │
│  └────────────────────────────────────────────────────────────────┘  │
├────────┬───────────────────────────────────────────┬─────────────────┤
│        │                                           │                 │
│ 左侧   │         中间主工作区                        │  右侧详情面板    │
│ 导航    │                                           │  (滑入时显示)    │
│ 模块    │  ┌─ 搜索框 ────────────────────────────┐  │                 │
│ 菜单    │  │  🔍 搜索账号、平台、责任人...       │  │  ┌───────────┐  │
│        │  └──────────────────────────────────────┘  │  │ 账号详情   │  │
│ 228px   │                                           │  │           │  │
│        │  ┌─ KPI 指标条 ─────────────────────────┐  │  │           │  │
│  📋     │  │ 总数│使用│闲置│风险│无负责人         │  │  │           │  │
│  账号   │  └──────────────────────────────────────┘  │  │           │  │
│  资产   │                                           │  │           │  │
│  📋     │  [视图1] [视图2] [视图3] [视图4] [视图5] [视图6]││  520px    │  │
│  操作   │                                           │  │           │  │
│  日志   │  [状态] [平台] [责任人] [风险] [活跃] [标签]│  │           │  │
│  ⚠️     │                                           │  │           │  │
│  风险   │  已选择 3 项  [转交] [标签] [禁用] [导出] │  │           │  │
│  提醒   │                                           │  │           │  │
│  ⚙️     │  ┌─ 数据表格 ──────────────────────────┐  │  │           │  │
│  系统   │  │ ☐ │ 账号 │ 平台 │ 状态 │ ... │ 操作   │  │  │           │  │
│  设置   │  ├───┼──────┼──────┼──────┤─────┤───────┤  │  │           │  │
│        │  │ ☐ │ xxx  │ 飞书  │ 使用 │ ... │ [编辑]│  │  │           │  │
│ [即将   │  │ ☐ │ yyy  │ 微信  │ 闲置 │ ... │ [编辑]│  │  │           │  │
│ 上线]   │  │ ...│      │      │      │     │       │  │  │           │  │
│        │  └────────────────────────────────────────┘  │  │           │  │
│        │                                           │  │           │  │
│        │  共 1,284 条  [<] [1] [2] [3] ... [42] [>]│  │           │  │
│        │                                           │  │           │  │
├────────┴───────────────────────────────────────────┴─────────────────┤
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Grid & Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2xs` | 4px | 内联紧凑间距、Badge 内边距 |
| `--space-xs` | 8px | 标签/筛选项间距、内联元素 |
| `--space-sm` | 12px | KPI 卡片间距、筛选器间距 |
| `--space-md` | 16px | 组件内边距、表格单元格内边距 |
| `--space-lg` | 20px | 卡片内边距、区域间距 |
| `--space-xl` | 24px | 页面边距、模块间距 |
| `--space-2xl` | 32px | 页面大区块间距 |
| `--space-3xl` | 48px | 页面顶部/底部间距 |
| `--space-4xl` | 64px | 特殊分隔间距 |

### 5.3 Page Max Width

- **Container max-width**: 1440px（居中）
- **Header 内容区**: max-width 1440px，`margin: 0 auto`
- **表格最小宽度**: 1200px（保证 14 列可读）

---

## 6. Depth & Elevation

### 6.1 Shadow Scale

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| Flat | `--shadow-none` | `none` | 默认表面 |
| Raised | `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 常规卡片 |
| Elevated | `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Hover 态卡片、下拉面板 |
| Floating | `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 弹出框、Tooltip |
| Modal | `--shadow-xl` | `0 20px 40px rgba(0,0,0,0.15)` | 模态框、右侧面板 |
| Sticky | `--shadow-sticky` | `0 1px 3px rgba(0,0,0,0.08)` | 固定表头、Header |

### 6.2 Z-index Scale

| Layer | Value | Elements |
|-------|-------|----------|
| Base | 0 | 页面背景、表面 |
| Content | 1 | 常规内容 |
| Sticky | 10 | 固定表头、Header |
| Dropdown | 100 | 下拉菜单、弹出选项 |
| Sidebar | 200 | 左侧导航 |
| Right Panel | 300 | 右侧详情面板 |
| Modal Backdrop | 400 | 模态遮罩层 |
| Modal | 410 | 模态框 |
| Toast | 500 | 通知提示 |
| Tooltip | 600 | 工具提示 |

### 6.3 Animation Timing

| 动画 | 时长 | Easing | 属性 |
|------|------|--------|------|
| 右侧面板滑入 | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `transform: translateX` |
| 模态弹窗 | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `opacity + transform: scale` |
| 遮罩层 | 200ms | `ease` | `opacity` |
| 表格行 Hover | 100ms | `ease` | `background-color` |
| 下拉展开 | 150ms | `ease` | `opacity + transform: translateY(-4px→0)` |
| KPI 数字动画 | 500ms | `ease-out` | 首次加载时 |
| 脱敏切换 | 200ms | `ease` | 占位符 ↔ 明文 |
| Toast 进入 | 250ms | `ease-out` | `translateY(-10px→0) + opacity` |
| Toast 退出 | 200ms | `ease-in` | `opacity: 1→0` |

---

## 7. Cautions

### Never Do

1. **不要使用高饱和度颜色做大面积背景** — 蓝灰体系用灰色层次建立层级，高饱和蓝仅用于强调和 CTA。

2. **不要过度使用红色** — 红色仅用于高风险标识（风险等级 Badge、高风险 KPI 数字）。正常状态和常规操作不使用红色。

3. **不要在表格中使用斑马行（zebra striping）** — 使用水平分割线替代斑马行，保持 Linear 式的极简表格样式。

4. **不要使用弹窗替代 tooltip 来提示权限不足** — 权限不足时始终使用 tooltip 显示"暂无权限"，禁止使用确认弹窗或模态弹窗。

5. **不要忽略脱敏字段的日志记录** — 每次敏感信息查看/复制操作必须写操作日志，并在界面上显示"已记录日志"指示。

6. **不要在同一页面使用超过 2 种弹窗同时打开** — 弹窗必须按顺序堆叠，右侧面板打开时弹窗应关闭。

7. **不要将表格行高设置小于 40px** — 数据表格行高最小 40px，保证可读性和点击区域舒适度。

8. **不要使用纯黑色文字** — 最重的文字使用 `--color-gray-800` (#1F2937) 而非纯黑 (#000000)。

9. **不要在右侧面板中内嵌表格** — 详情面板使用表单视图展示数据，不使用表格组件。

10. **不要使用大于 800px 的模态弹窗** — 弹窗宽度限制在 640-800px，超过此尺寸的内容考虑分步表单。

### Prefer

- 用「灰色层次」而非「颜色对比」来区分信息层级
- 用「水平分割线」替代「斑马行」来分隔表格行
- 用「左侧色条」替代「全色背景」来标注 KPI 卡片和状态
- 用「tooltip + disabled 按钮」替代「隐藏元素」来处理权限不足
- 用「右侧面板」替代「新页面跳转」来查看详情
- 用「脱敏占位符（••••••）」替代「完全隐藏」敏感信息
- 用「300ms 防抖」替代「即时搜索」减轻后端压力
- 用「30 秒超时自动恢复脱敏」确保明文不会长时间暴露

---

## 8. Responsive Behavior

### 8.1 Breakpoints

| Name | Width | Column | Behavior |
|------|-------|--------|----------|
| Mobile | < 768px | 1 → 4 | 单列堆叠，侧栏→底部Tab，表格→卡片模式 |
| Tablet | 768 ~ 1024px | 4 → 8 | 侧栏折叠（图标+Tooltip），详情面板全宽覆盖 |
| Desktop | 1024 ~ 1440px | 12 | 完整三栏布局，侧栏展开 |
| Wide | > 1440px | 12 + max | 最大 1440px 居中，侧栏展开 |

### 8.2 Adaptation Rules

1. **侧栏** — 桌面展开 228px → 平板折叠 64px（图标+Tooltip） → 移动端底部 TabBar 56px
2. **右侧面板** — 桌面 520px 侧栏 → 平板 100% 宽度 + 半透明遮罩 → 移动端全屏覆盖
3. **表格** — 桌面 14 列完整显示 → 平板 8 列 + 横向滚动 → 移动端切换为卡片列表
4. **KPI 指标条** — 桌面 5 列水平 → 平板 3+2 换行 → 移动端 2+2+1 网格
5. **筛选栏** — 桌面 6 维水平 + 折叠更多 → 平板 4 维 + 折叠更多 → 移动端 2 维 + 折叠面板
6. **模态弹窗** — 桌面 640-800px → 平板 90% 宽度 → 移动端 100% 宽度（全屏弹窗）
7. **视图 Tabs** — 桌面全部显示 → 平板 + 移动端折叠为下拉选择器

---

## 9. Agent Prompt Guide

### Key Instructions

1. **浅色模式优先** — 所有组件默认为浅色模式（Linear 风格），后续有深色模式需求再扩展。起始背景 `var(--color-bg-primary)` (#F7F8FA)。

2. **表格是页面的核心** — 账号资产主页以表格为绝对中心。固定表头 + 首列固定 + 横向滚动是必选项。行高统一 48px。

3. **右侧面板不是页面跳转** — 所有"查看详情"操作使用右侧滑出面板，不使用新页面。面板宽度 520px，动画 300ms ease。

4. **敏感信息安全是第一优先** — 所有敏感字段默认脱敏显示（`var(--color-masked-bg)` + `•` 占位符）。查看/复制操作需权限验证并记录操作日志。

5. **角色感知 UI** — 页面元素根据用户角色自动显示/隐藏/禁用。权限不足时不弹窗，使用 tooltip 提示。

6. **红色使用克制** — 红色仅用于高风险状态标识。常规界面元素禁止使用红色。

7. **300ms 防抖** — 全局搜索框必须实现 300ms 防抖，避免频繁请求。

8. **30 秒脱敏超时** — 明文显示敏感信息后，30 秒自动恢复脱敏状态。

9. **"即将上线"标记** — V1 版本中未实现的菜单项标记为灰色 + "即将上线"标签，不可点击。

10. **三栏布局原则** — 左侧导航(228px) + 中间主区(flex: 1) + 右侧面板(520px, 仅在需要时显示)。

### Quick CSS Snippet

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #F7F8FA;
  --color-bg-secondary: #F0F1F3;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F3F4F6;
  --color-surface-elevated: #FFFFFF;

  /* Primary Blue */
  --color-primary: #2B6CB0;
  --color-primary-hover: #1A4F8A;
  --color-primary-active: #0F3A6B;
  --color-primary-subtle: #EBF1FA;
  --color-primary-muted: rgba(43, 108, 176, 0.12);

  /* Neutral Gray */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Semantic */
  --color-danger: #DC2626;
  --color-danger-bg: #FEF2F2;
  --color-warning: #D97706;
  --color-warning-bg: #FFFBEB;
  --color-success: #059669;
  --color-success-bg: #ECFDF5;
  --color-idle: #9CA3AF;
  --color-idle-bg: #F3F4F6;
  --color-info: #2563EB;
  --color-info-bg: #EFF6FF;

  /* Masked Field */
  --color-masked-bg: #F3F4F6;
  --color-masked-text: #9CA3AF;
  --color-masked-border: #E5E7EB;
  --color-revealed-indicator: #DC2626;

  /* Text */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-text-on-primary: #FFFFFF;
  --color-text-link: #2B6CB0;

  /* Borders */
  --color-border: #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-divider: #F0F1F3;

  /* Spacing */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 20px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  --space-4xl: 64px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Menlo', monospace;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 16px;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
  --shadow-sticky: 0 1px 3px rgba(0,0,0,0.08);
}
```
