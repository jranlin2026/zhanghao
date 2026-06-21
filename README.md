# 公司账号资产管理系统 V2

内部账号资产台账系统，第一版聚焦“设备 -> 手机号 -> 互联网账号”三层资产闭环。

## 本地开发

后端：

```bash
cd backend
npm install
copy .env.example .env
npm run db:generate
npm run build
npm test
```

前端：

```bash
cd frontend
npm install
npm run dev
```

## Docker 部署

需要服务器已安装 Docker 和 Docker Compose。

```bash
docker compose up --build
```

服务：

- 前端：http://localhost
- 后端：http://localhost:3001/api/health
- 数据库：Postgres 16

首次启动会自动执行 Prisma migration 和 seed。

默认账号：

- 管理员：`admin / admin123`
- 老板：`老板 / boss123`
- 员工：`王伟 / employee123`

上线前必须修改 `docker-compose.yml` 中的 `JWT_SECRET` 和数据库密码。

## 当前范围

已实现：

- 登录与三角色基础权限
- 设备、手机号、互联网账号 CRUD
- 搜索、详情、基础 KPI
- 操作日志、基础风险列表
- 字段脱敏展示
- Docker Compose 部署骨架

暂不包含：

- Excel 导入导出
- 审批流
- 离职交接
- 密码/实名信息加密库
