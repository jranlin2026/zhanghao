# 上线检查清单

## 本地检查

- 运行 `npm run verify`。
- 确认 `backend/prisma/migrations` 包含所有 schema 变更。
- 确认 `.env`、数据库密码、JWT 密钥没有提交到仓库。

## 服务器配置

- 安装 Docker 和 Docker Compose。
- 设置 `POSTGRES_PASSWORD`、`JWT_SECRET`、`FRONTEND_URL`。
- `JWT_SECRET` 至少 32 个字符。
- `FRONTEND_URL` 多个来源用英文逗号分隔。

## 部署命令

```bash
docker compose up --build -d
docker compose ps
docker compose logs backend --tail=100
```

## 验收

- 访问 `/api/health`，确认数据库状态为 `connected`。
- 使用 `admin / admin123` 登录后立即修改生产账号策略。
- 验证设备、手机号、互联网账号三个视图可查询、可新增、可编辑、可注销。
- 验证老板账号只读，员工账号只能看到相关资产。
