# Stock Daily - 股票交易日记系统

一个功能完整的股票交易管理系统，帮助投资者记录交易、分析收益、优化策略。

## 目录

- [核心功能](#-核心功能)
- [系统架构](#-系统架构)
- [快速开始](#-快速开始)
- [环境变量配置](#-环境变量配置)
- [API 文档](#-api-文档)
- [WebSocket 实时推送](#-websocket-实时推送)
- [技术指标说明](#-技术指标说明)
- [回测引擎](#-回测引擎)
- [定时任务](#-定时任务)
- [数据库备份](#-数据库备份)
- [日志系统](#-日志系统)
- [常用命令](#-常用命令)
- [项目结构](#-项目结构)
- [安全说明](#-安全说明)

---

## ✨ 核心功能

### 📊 交易管理
- **交易日记** - 记录每日交易计划、执行和总结
- **持仓管理** - 实时跟踪持仓状态和盈亏
- **交易历史** - 完整的交易记录和查询
- **交易计划** - 制定买入/卖出计划，设置目标价和止损价
- **交易复盘** - 记录交易经验教训，持续改进

### 📈 数据分析
- **AI 大盘分析** - 智能分析热门板块、技术形态，生成 AI 选股报告
- **交易统计仪表盘** - 胜率、盈亏比、最大回撤、夏普比率等核心指标
- **持仓相关性分析** - Pearson 相关系数、分散化评分
- **交易行为分析** - 交易模式识别、行为偏差检测
- **收益曲线** - 可视化收益趋势和回撤分析
- **统计报表** - 多维度交易统计和绩效评估

### 🎯 投资工具
- **股票行情** - 实时股票行情查询和 K 线图
- **自选股管理** - 自定义股票监控列表，支持目标价提醒
- **股票对比** - 多股票横向对比分析
- **交易信号** - 技术指标和交易信号提醒
- **回测系统** - 策略回测和验证
- **网格计算器** - 网格交易参数计算
- **补仓计算器** - 智能补仓方案计算
- **模拟交易** - 无风险模拟交易练习

### 📅 辅助功能
- **交易日历** - 财报发布、分红派息、IPO 申购等事件提醒
- **分红管理** - 分红记录和收益统计
- **学习笔记** - 投资知识积累和整理
- **投资目标** - 设定和跟踪投资目标
- **投资组合** - 多账户组合管理
- **数据导入导出** - 支持数据备份和迁移

## 🛠️ 系统架构

### 前端技术栈
- **React 19** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - 企业级 UI 组件库
- **ECharts** - 专业 K 线图和数据可视化
- **Zustand** - 轻量级状态管理
- **Vite** - 快速构建工具

### 后端技术栈
- **Node.js + Express** - 高性能服务端
- **TypeScript** - 类型安全
- **Prisma** - 现代化 ORM
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存和会话管理
- **WebSocket** - 实时数据推送
- **JWT** - 身份认证
- **Winston** - 日志系统
- **node-cron** - 定时任务

### 部署架构
- **Docker** - 容器化部署
- **Nginx** - 反向代理
- **Docker Compose** - 服务编排

## 🚀 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

### 一键部署

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
# 浏览器打开 http://localhost
```

### 开发环境

```bash
# 启动开发环境
make dev

# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

## 📋 环境变量配置

### 必需配置

```bash
# 数据库
POSTGRES_USER=stockuser
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=stockdaily

# Redis
REDIS_URL=redis://redis:6379

# JWT 认证
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 可选配置

```bash
# 邮件通知 (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com

# AI 分析
AI_API_KEY=your-openai-api-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo

# 日志
LOG_LEVEL=info          # debug, info, warn, error
LOG_DIR=logs
```

---

## 📡 API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 获取当前用户 |

### 股票接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stocks/quote/:code` | 获取实时行情 |
| GET | `/api/stocks/kline/:code` | 获取K线数据 |
| GET | `/api/stocks/search` | 搜索股票 |
| GET | `/api/stocks/indicators/:code` | 获取技术指标 |

### 市场接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/market/sentiment` | 市场情绪 |
| GET | `/api/market/sectors` | 板块数据 |
| GET | `/api/market/dragon-tiger` | 龙虎榜 |
| GET | `/api/market/north-flow` | 北向资金 |

### 交易接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/trades` | 交易列表 |
| POST | `/api/trades` | 创建交易 |
| GET | `/api/positions` | 持仓列表 |
| GET | `/api/statistics` | 交易统计 |

### 数据导入导出

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/data/import/csv` | 导入CSV交易数据 |
| POST | `/api/data/import/excel` | 导入Excel交易数据 |
| GET | `/api/data/export/csv` | 导出交易数据为CSV |
| GET | `/api/data/export/excel` | 导出交易数据为Excel |
| GET | `/api/data/export/positions` | 导出持仓数据 |
| GET | `/api/data/export/watchlist` | 导出自选股数据 |
| GET | `/api/data/export/all` | 导出所有数据 |

### 价格提醒

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/alerts` | 获取提醒列表 |
| POST | `/api/alerts` | 创建价格提醒 |
| POST | `/api/alerts/check` | 检查价格提醒 |
| PUT | `/api/alerts/:id` | 更新提醒 |
| DELETE | `/api/alerts/:id` | 删除提醒 |

### 交易信号

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/signals` | 获取信号列表 |
| POST | `/api/signal-generator/generate` | 生成交易信号 |
| POST | `/api/signal-generator/save` | 保存信号 |
| GET | `/api/signal-generator/config` | 获取信号配置 |

### 投资组合

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/portfolio/industry` | 获取行业分布 |
| POST | `/api/portfolio/risk` | 获取风险指标 |
| POST | `/api/portfolio/warnings` | 获取仓位预警 |
| POST | `/api/portfolio/analysis` | 获取组合分析 |

### Swagger 文档

访问 `/api-docs` 查看交互式 API 文档。

---

## 🔌 WebSocket 实时推送

### 连接方式

```javascript
// 连接 WebSocket (可选带 token 认证)
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT');

// 连接成功
ws.onopen = () => {
  console.log('WebSocket connected');
};

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### 订阅频道

```javascript
// 订阅市场数据
ws.send(JSON.stringify({ type: 'subscribe', channel: 'market' }));

// 订阅股票行情
ws.send(JSON.stringify({ type: 'subscribe', channel: 'quote:600519' }));

// 取消订阅
ws.send(JSON.stringify({ type: 'unsubscribe', channel: 'market' }));

// 心跳检测
ws.send(JSON.stringify({ type: 'ping' }));
```

### 消息格式

```javascript
// 订阅确认
{ "type": "subscribed", "channel": "market" }

// 数据推送
{ "type": "message", "channel": "market", "data": {...} }

// 用户通知
{ "type": "notification", "data": {...} }
```

---

## 📊 技术指标说明

### MACD (指数平滑异同移动平均线)

```
DIF = EMA(12) - EMA(26)
DEA = EMA(DIF, 9)
MACD = (DIF - DEA) × 2
```

| 信号 | 说明 |
|------|------|
| 金叉 | DIF 上穿 DEA，买入信号 |
| 死叉 | DIF 下穿 DEA，卖出信号 |
| 顶背离 | 价格新高但 MACD 未新高 |
| 底背离 | 价格新低但 MACD 未新低 |

### KDJ (随机指标)

```
RSV = (收盘价 - N日最低) / (N日最高 - N日最低) × 100
K = 2/3 × 前K + 1/3 × RSV
D = 2/3 × 前D + 1/3 × K
J = 3K - 2D
```

| 区间 | 说明 |
|------|------|
| K/D > 80 | 超买区，注意回调 |
| K/D < 20 | 超卖区，关注反弹 |
| J > 100 | 极度超买 |
| J < 0 | 极度超卖 |

### RSI (相对强弱指标)

```
RS = N日涨幅平均值 / N日跌幅平均值
RSI = 100 - 100/(1+RS)
```

| 区间 | 说明 |
|------|------|
| RSI > 70 | 超买 |
| RSI < 30 | 超卖 |
| RSI = 50 | 多空平衡 |

### 布林带 (BOLL)

```
中轨 = MA(20)
上轨 = 中轨 + 2 × 标准差
下轨 = 中轨 - 2 × 标准差
```

---

## 🔄 回测引擎

### 配置参数

```typescript
interface BacktestConfig {
  initialCapital: number;  // 初始资金，默认 100000
  positionSize: number;    // 仓位比例，默认 0.3 (30%)
  stopLoss: number;        // 止损比例，默认 0.05 (5%)
  takeProfit: number;      // 止盈比例，默认 0.1 (10%)
  commission: number;      // 手续费率，默认 0.0003
  slippage: number;        // 滑点，默认 0.001
}
```

### 回测结果

```typescript
interface BacktestResult {
  totalTrades: number;     // 总交易次数
  winTrades: number;       // 盈利次数
  lossTrades: number;      // 亏损次数
  winRate: number;         // 胜率 (%)
  totalProfit: number;     // 总收益
  totalProfitRate: number; // 总收益率 (%)
  maxDrawdown: number;     // 最大回撤 (%)
  sharpeRatio: number;     // 夏普比率
  finalCapital: number;    // 最终资金
}
```

---

## ⏰ 定时任务

| 任务 | 执行时间 | 说明 |
|------|----------|------|
| updateMarketData | 交易日 9:00-15:00 每分钟 | 更新市场情绪和板块数据 |
| updateDragonTiger | 交易日 15:30 | 更新龙虎榜数据 |
| updateNorthFlow | 交易日 17:00 | 更新北向资金数据 |
| cleanupCache | 每天 9:00 | 清理过期缓存 |

---

## 💾 数据库备份

```bash
# 创建备份
./scripts/backup.sh backup

# 查看备份列表
./scripts/backup.sh list

# 从备份恢复
./scripts/backup.sh restore backups/stockdaily_20240101_120000.sql.gz

# 清理7天前的备份
./scripts/backup.sh cleanup 7
```

---

## 📝 日志系统

### 日志级别

| 级别 | 说明 |
|------|------|
| error | 错误信息 |
| warn | 警告信息 |
| info | 一般信息 |
| debug | 调试信息 |

### 日志文件

```
logs/
├── app-2024-01-01.log      # 应用日志 (保留14天)
├── error-2024-01-01.log    # 错误日志 (保留30天)
```

### 日志格式

```
2024-01-01 10:30:00 [INFO]: Server is running on port 3000
2024-01-01 10:30:01 [ERROR]: Database connection failed
```

---

## 🔧 常用命令

```bash
# 生产环境
make prod          # 启动生产环境
make prod-down     # 停止生产环境
make prod-restart  # 重启生产环境

# 开发环境
make dev           # 启动开发环境
make dev-down      # 停止开发环境
make dev-logs      # 查看开发环境日志

# 日志查看
make logs          # 查看所有日志
make logs-backend  # 查看后端日志
make logs-frontend # 查看前端日志
make logs-db       # 查看数据库日志
make logs-redis    # 查看 Redis 日志

# 数据库管理
make migrate       # 运行数据库迁移
make db-studio     # 打开 Prisma Studio
make db-shell      # 进入 PostgreSQL 命令行
make db-reset      # 重置数据库 (危险)

# Redis
make redis-cli     # 进入 Redis 命令行

# 健康检查
make health        # 检查所有服务状态
make status        # 查看容器状态

# 其他
make setup         # 初始化环境配置
make check         # 检查环境依赖
make build         # 构建镜像
make clean         # 清理容器和数据
```

---

## 📁 项目结构

```
stock-daily/
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   │   ├── KLineChart.tsx # K线图表
│   │   │   ├── AIMarketAnalysis.tsx
│   │   │   └── ...
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   ├── stores/            # 状态管理
│   │   └── utils/             # 工具函数
│   └── package.json
├── backend/                   # 后端项目
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 业务逻辑
│   │   │   ├── cache.service.ts
│   │   │   ├── session.service.ts
│   │   │   ├── websocket.service.ts
│   │   │   ├── scheduler.service.ts
│   │   │   ├── logger.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── indicator.service.ts
│   │   │   ├── backtestEngine.service.ts
│   │   │   ├── aiAnalysis.service.ts
│   │   │   └── ...
│   │   ├── routes/            # 路由定义
│   │   └── middlewares/       # 中间件
│   │       ├── auth.middleware.ts
│   │       ├── rateLimit.middleware.ts
│   │       └── errorHandler.ts
│   ├── prisma/                # 数据库模型
│   └── package.json
├── scripts/                   # 脚本
│   ├── backup.sh              # 数据库备份
│   └── deploy.sh              # 部署脚本
├── logs/                      # 日志目录
├── backups/                   # 备份目录
├── docker-compose.yml         # 生产配置
├── docker-compose.dev.yml     # 开发配置
├── Makefile                   # 构建脚本
└── README.md
```

## 🔐 安全说明

- 生产环境请务必修改默认密码
- JWT_SECRET 请使用强随机字符串
- 建议启用 HTTPS
- 定期备份数据库

## 📝 开发计划

- [x] AI 大盘分析和智能选股
- [x] 交易统计仪表盘
- [x] 持仓相关性分析
- [x] 交易行为分析
- [x] 交易计划管理
- [x] 交易复盘模板
- [x] 交易日历事件
- [ ] 添加单元测试和集成测试
- [ ] 实现 API 文档（Swagger）
- [ ] 添加 Redis 缓存层
- [ ] 实现实时行情推送（WebSocket）
- [ ] 添加性能监控和日志系统

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 本系统仅供个人学习和研究使用，投资有风险，入市需谨慎。
