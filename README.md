# 天然气全链条安全智管智能体

这是“天然气全链条安全智管智能体”的前端源码项目，可交付给前端开发人员继续开发。当前仓库同时保留两类源码：

- 根目录静态页面：`index.html`、`styles.css`、`data.js`、`app.js`，这是当前线上和本地 `file://` 方式直接打开时使用的页面。
- Vue/Vite 工程源码：`src/`、`public/`、`vite.config.ts`、`tsconfig*.json`，用于后续组件化开发、类型检查和工程化构建。

## 技术栈

- Node.js
- pnpm
- Vite 6
- Vue 3
- TypeScript
- Pinia
- Vue Router
- Element Plus
- Axios

## Node.js 版本

推荐使用 Node.js 20 LTS 或更高版本。当前项目已在 Node.js 24 环境下完成依赖安装和构建验证。

## 安装依赖

```bash
pnpm install
```

如果本机尚未安装 pnpm，可先安装：

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
```

## 本地启动

```bash
pnpm dev
```

启动后访问终端输出的本地地址，通常为：

```text
http://localhost:5173/
```

当前根目录 `index.html` 也可以直接用浏览器打开，适合快速预览静态页面。

## 打包构建

```bash
pnpm build
```

构建产物输出到 `dist/`。`build` 脚本会先执行 TypeScript 类型检查，再执行 Vite 构建，并复制当前静态页面运行所需的 `app.js`、`data.js` 到 `dist/`。

## 环境变量

请复制 `.env.example` 为 `.env.local` 后按环境修改：

```bash
cp .env.example .env.local
```

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | 后端 API 基础路径，用于 `src/api/http.ts` 中的 Axios 实例。 |

当前项目没有提交真实 Token、密钥或私有后端地址。

## 主要目录说明

| 路径 | 说明 |
| --- | --- |
| `index.html` | 当前静态页面入口。 |
| `app.js` | 当前静态页面交互、渲染和业务逻辑。 |
| `data.js` | 当前静态页面 mock 数据。 |
| `styles.css` | 当前静态页面样式。 |
| `src/` | Vue/Vite 组件化源码。 |
| `src/api/` | 后端接口封装位置。 |
| `src/mock/` | Vue 工程 mock 数据。 |
| `src/stores/` | Pinia 状态管理。 |
| `src/components/dashboard/` | 驾驶舱组件。 |
| `src/styles/` | Vue 工程样式。 |
| `public/assets/` | Vite 构建会直接复制的图片、视频等静态资源。 |
| `scripts/` | 工程辅助脚本。 |

## 后端 API 对接位置

- Axios 实例：`src/api/http.ts`
- 数据请求入口：`src/api/dashboard.ts`
- 环境变量：`VITE_API_BASE_URL`

当前 Vue 工程默认返回 `src/mock/dashboard.ts` 中的 mock 数据。对接真实后端时，优先在 `src/api/dashboard.ts` 中替换 `fetchDashboardData()` 的实现，并通过 `VITE_API_BASE_URL` 配置后端基础地址。

## 交付说明

源码交付包应包含 `src/`、`public/`、根目录静态页面文件、依赖配置、TypeScript/Vite 配置、README 和 `.env.example`。

源码交付包不应包含：

- `node_modules/`
- `dist/`
- `.git/`
- `.DS_Store`
- IDE 配置
- 缓存文件
- 临时文件
- 日志文件
