# Stock Daily - 股票交易日记系统

一个功能完整的股票交易管理系统，帮助投资者记录交易、分析收益、优化策略。

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

## 🛠️ 技术栈

### 前端
- **React 19** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - 企业级 UI 组件库
- **ECharts** - 专业数据可视化
- **Zustand** - 轻量级状态管理
- **Vite** - 快速构建工具

### 后端
- **Node.js + Express** - 高性能服务端
- **TypeScript** - 类型安全
- **Prisma** - 现代化 ORM
- **PostgreSQL** - 可靠的关系型数据库
- **JWT** - 安全的身份认证

### 部署
- **Docker** - 容器化部署
- **Nginx** - 反向代理和静态资源服务
- **Docker Compose** - 一键部署

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

## 📖 详细文档

- [部署指南](DEPLOY.md) - 完整的部署和配置说明
- [环境变量配置](.env.example) - 环境变量说明

## 🔧 常用命令

```bash
# 生产环境
make prod          # 启动生产环境
make prod-stop     # 停止生产环境
make prod-restart  # 重启生产环境
make prod-logs     # 查看生产环境日志

# 开发环境
make dev           # 启动开发环境
make dev-stop      # 停止开发环境
make dev-logs      # 查看开发环境日志

# 数据库管理
make db-migrate    # 运行数据库迁移
make db-studio     # 打开 Prisma Studio

# 其他
make check         # 检查环境
make clean         # 清理容器和数据
```

## 📁 项目结构

```
stock-daily/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/    # 通用组件 (K线图、AI分析等)
│   │   ├── pages/         # 页面组件
│   │   │   ├── dashboard/ # 仪表盘
│   │   │   ├── diary/     # 交易日记
│   │   │   ├── quotes/    # 股票行情
│   │   │   ├── market/    # 市场分析
│   │   │   ├── tools/     # 交易工具
│   │   │   ├── calendar/  # 交易日历
│   │   │   └── review/    # 交易复盘
│   │   ├── services/      # API 服务
│   │   ├── router/        # 路由配置
│   │   └── stores/        # 状态管理
│   └── package.json
├── backend/               # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── routes/        # 路由定义
│   │   └── middlewares/   # 中间件
│   ├── prisma/            # 数据库模型
│   └── package.json
├── docker-compose.yml     # Docker 生产配置
├── docker-compose.dev.yml # Docker 开发配置
├── Makefile               # 构建脚本
├── DEPLOY.md              # 部署文档
└── README.md              # 项目说明
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
