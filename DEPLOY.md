# Stock Daily - 部署指南

## 目录

- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [配置说明](#配置说明)
- [部署步骤](#部署步骤)
- [常用命令](#常用命令)
- [数据库管理](#数据库管理)
- [故障排除](#故障排除)

## 快速开始

```bash
# 1. 克隆项目
git clone <repository-url>
cd stock-daily

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库密码和 JWT 密钥

# 3. 启动服务
make prod

# 4. 访问应用
# http://localhost
```

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 检查环境

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker compose version

# 运行环境检查
make check
```

## 配置说明

### 环境变量

复制 `.env.example` 到 `.env` 并修改以下配置：

| 变量 | 说明 | 默认值 | 生产环境建议 |
|------|------|--------|--------------|
| `POSTGRES_USER` | 数据库用户名 | stockuser | 保持默认或自定义 |
| `POSTGRES_PASSWORD` | 数据库密码 | stockpass | **必须修改为强密码** |
| `POSTGRES_DB` | 数据库名称 | stockdaily | 保持默认 |
| `JWT_SECRET` | JWT 签名密钥 | - | **必须设置为随机字符串** |
| `JWT_EXPIRES_IN` | Token 过期时间 | 7d | 根据需求调整 |
| `FRONTEND_PORT` | 前端端口 | 80 | 根据需求调整 |
| `CORS_ORIGIN` | 允许的跨域来源 | http://localhost | 设置为实际域名 |

### 生成安全的 JWT_SECRET

```bash
# 使用 openssl 生成
openssl rand -base64 64

# 或使用 node
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## 部署步骤

### 1. 首次部署

```bash
# 初始化配置
make setup

# 编辑环境变量
vim .env

# 构建并启动
make prod
```

### 2. 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
make restart
```

### 3. 查看状态

```bash
# 查看服务状态
make status

# 查看日志
make logs

# 健康检查
make health
```

## 常用命令

### 使用 Makefile

```bash
make help          # 显示所有可用命令
make prod          # 启动生产环境
make prod-down     # 停止生产环境
make restart       # 重启所有服务
make logs          # 查看所有日志
make logs-backend  # 查看后端日志
make status        # 查看服务状态
make clean         # 清理容器和数据卷
```

### 使用部署脚本

```bash
./scripts/deploy.sh up       # 启动服务
./scripts/deploy.sh down     # 停止服务
./scripts/deploy.sh restart  # 重启服务
./scripts/deploy.sh logs     # 查看日志
./scripts/deploy.sh status   # 查看状态
./scripts/deploy.sh build    # 重新构建
./scripts/deploy.sh clean    # 清理所有
```

### 直接使用 Docker Compose

```bash
docker compose up -d --build  # 构建并启动
docker compose down           # 停止
docker compose logs -f        # 查看日志
docker compose ps             # 查看状态
```

## 数据库管理

### 数据库迁移

```bash
# 运行迁移
make migrate

# 或直接执行
docker compose exec backend npx prisma migrate deploy
```

### 数据库备份

```bash
# 创建备份
make backup
# 或
./scripts/backup.sh backup

# 查看备份列表
./scripts/backup.sh list

# 恢复备份
./scripts/backup.sh restore backups/stockdaily_20240101_120000.sql.gz

# 清理旧备份（保留最近7天）
./scripts/backup.sh cleanup 7
```

### 数据库连接

```bash
# 进入 PostgreSQL 命令行
make db-shell

# 或直接连接
docker compose exec postgres psql -U stockuser -d stockdaily
```

## 故障排除

### 服务无法启动

1. 检查端口占用：
```bash
# 检查 80 端口
lsof -i :80

# 检查 5432 端口
lsof -i :5432
```

2. 检查日志：
```bash
make logs
```

3. 检查容器状态：
```bash
docker compose ps -a
```

### 数据库连接失败

1. 确认数据库容器正在运行：
```bash
docker compose ps postgres
```

2. 检查数据库日志：
```bash
make logs-db
```

3. 验证数据库连接：
```bash
docker compose exec postgres pg_isready -U stockuser -d stockdaily
```

### 前端无法访问后端 API

1. 检查后端健康状态：
```bash
curl http://localhost/health
```

2. 检查 nginx 配置：
```bash
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

3. 检查网络连接：
```bash
docker compose exec frontend ping backend
```

### 重置所有数据

⚠️ **警告：此操作将删除所有数据！**

```bash
# 停止并删除所有容器和数据卷
make clean

# 重新启动
make prod
```

## 生产环境建议

### 安全性

1. **修改默认密码**：确保 `POSTGRES_PASSWORD` 和 `JWT_SECRET` 使用强密码
2. **限制端口暴露**：仅暴露必要的端口（默认只暴露 80）
3. **使用 HTTPS**：在生产环境中配置 SSL/TLS
4. **定期备份**：设置定时任务自动备份数据库

### 性能

1. **资源限制**：根据服务器配置调整 Docker 资源限制
2. **日志轮转**：配置 Docker 日志轮转避免磁盘占满
3. **监控**：设置服务监控和告警

### 自动备份（Cron）

```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨 2 点备份
0 2 * * * /path/to/stock-daily/scripts/backup.sh backup

# 添加每周清理旧备份
0 3 * * 0 /path/to/stock-daily/scripts/backup.sh cleanup 30
```

## 架构说明

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP :80
┌─────────────────────────▼───────────────────────────────┐
│                   Nginx (Frontend)                       │
│                   - 静态文件服务                          │
│                   - API 反向代理                          │
└─────────────────────────┬───────────────────────────────┘
                          │ /api/* → backend:3000
┌─────────────────────────▼───────────────────────────────┐
│                   Express (Backend)                      │
│                   - REST API                             │
│                   - JWT 认证                             │
│                   - Prisma ORM                           │
└─────────────────────────┬───────────────────────────────┘
                          │ PostgreSQL Protocol
┌─────────────────────────▼───────────────────────────────┐
│                   PostgreSQL                             │
│                   - 数据持久化                            │
│                   - 数据卷挂载                            │
└─────────────────────────────────────────────────────────┘
```

## API 路由说明

### 核心业务 API

| 路由 | 说明 | 认证 |
|------|------|------|
| `/api/auth` | 用户认证（登录/注册） | 否 |
| `/api/diaries` | 交易日记 | 是 |
| `/api/trades` | 交易记录 | 是 |
| `/api/positions` | 持仓管理 | 是 |
| `/api/watchlist` | 自选股管理 | 是 |

### 分析功能 API

| 路由 | 说明 | 认证 |
|------|------|------|
| `/api/ai-analysis` | AI 大盘分析 | 是 |
| `/api/dashboard` | 交易统计仪表盘 | 是 |
| `/api/correlation` | 持仓相关性分析 | 是 |
| `/api/behavior` | 交易行为分析 | 是 |
| `/api/statistics` | 统计报表 | 是 |

### 工具功能 API

| 路由 | 说明 | 认证 |
|------|------|------|
| `/api/stocks` | 股票行情查询 | 否 |
| `/api/trade-plans` | 交易计划管理 | 是 |
| `/api/trade-reviews` | 交易复盘模板 | 是 |
| `/api/calendar-events` | 日历事件 | 是 |
| `/api/goals` | 投资目标 | 是 |
| `/api/notes` | 学习笔记 | 是 |
| `/api/dividends` | 分红记录 | 是 |
| `/api/simulator` | 模拟交易 | 是 |
