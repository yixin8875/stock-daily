# 技术架构文档：股票日记本系统

**文档版本**: v1.0
**创建日期**: 2026-01-26
**技术方案**: 全栈JavaScript

---

## 1. 技术栈总览

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| **前端框架** | React | 18.x |
| **UI组件库** | Ant Design | 5.x |
| **状态管理** | Zustand | 4.x |
| **路由** | React Router | 6.x |
| **HTTP客户端** | Axios | 1.x |
| **图表库** | ECharts | 5.x |
| **构建工具** | Vite | 5.x |
| **后端框架** | Express.js | 4.x |
| **ORM** | Prisma | 5.x |
| **数据库** | PostgreSQL | 15+ |
| **认证** | JWT + bcrypt | - |
| **API文档** | Swagger | - |

---

## 2. 项目结构

```
stock-daily/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/            # 页面组件
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── stores/           # Zustand状态
│   │   ├── services/         # API服务
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # TypeScript类型
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── services/         # 业务逻辑
│   │   ├── routes/           # 路由定义
│   │   ├── middlewares/      # 中间件
│   │   ├── utils/            # 工具函数
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma     # 数据库模型
│   └── package.json
│
├── ai-management/            # AI管理文档
│   └── specs/                # 需求文档
│
└── docker-compose.yml        # Docker配置
```

---

## 3. 前端架构

### 3.1 页面结构

```
pages/
├── auth/
│   ├── Login.tsx             # 登录页
│   └── Register.tsx          # 注册页
├── diary/
│   ├── TodaySummary.tsx      # 今日总结
│   ├── TomorrowPlan.tsx      # 明日计划
│   └── DiaryDetail.tsx       # 日记详情
├── history/
│   ├── CalendarView.tsx      # 日历视图
│   └── ListView.tsx          # 列表视图
├── statistics/
│   └── Dashboard.tsx         # 统计面板
└── Layout.tsx                # 布局组件
```

### 3.2 状态管理 (Zustand)

```typescript
// stores/diaryStore.ts
interface DiaryState {
  currentDiary: Diary | null;
  diaryList: Diary[];
  loading: boolean;
  fetchDiary: (date: string) => Promise<void>;
  saveDiary: (data: DiaryInput) => Promise<void>;
}
```

### 3.3 核心组件

| 组件 | 功能 |
|------|------|
| `MarketSummaryCard` | 大盘点评卡片 |
| `TradeRecordList` | 交易记录列表 |
| `ProfitLossCard` | 盈亏情况卡片 |
| `ReflectionForm` | 操作反思表单 |
| `WatchStockList` | 关注股票列表 |
| `TradePlanForm` | 买卖计划表单 |
| `DiaryCalendar` | 日记日历组件 |
| `StatisticsChart` | 统计图表组件 |

---

## 4. 后端架构

### 4.1 API设计 (RESTful)

#### 认证模块
```
POST   /api/auth/register     # 用户注册
POST   /api/auth/login        # 用户登录
POST   /api/auth/logout       # 用户登出
GET    /api/auth/me           # 获取当前用户
```

#### 日记模块
```
GET    /api/diaries           # 获取日记列表
GET    /api/diaries/:date     # 获取指定日期日记
POST   /api/diaries           # 创建日记
PUT    /api/diaries/:id       # 更新日记
DELETE /api/diaries/:id       # 删除日记
```

#### 交易记录模块
```
GET    /api/trades            # 获取交易记录
POST   /api/trades            # 添加交易记录
PUT    /api/trades/:id        # 更新交易记录
DELETE /api/trades/:id        # 删除交易记录
```

#### 计划模块
```
GET    /api/plans/:diaryId    # 获取明日计划
POST   /api/plans/watch       # 添加关注股票
POST   /api/plans/buy         # 添加买入计划
POST   /api/plans/sell        # 添加卖出计划
DELETE /api/plans/:id         # 删除计划
```

#### 统计模块
```
GET    /api/statistics/summary    # 获取统计摘要
GET    /api/statistics/profit     # 获取收益曲线
GET    /api/statistics/trades     # 获取交易统计
```

### 4.2 中间件

```typescript
// middlewares/
├── auth.ts           # JWT认证中间件
├── errorHandler.ts   # 全局错误处理
├── validator.ts      # 请求参数校验
└── logger.ts         # 请求日志
```

---

## 5. 数据库设计 (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  username  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  diaries   Diary[]
  tags      Tag[]
}

model Diary {
  id                String   @id @default(uuid())
  userId            String
  date              DateTime @unique
  marketTrend       MarketTrend?
  marketVolume      MarketVolume?
  marketComment     String?
  hotSectors        String[]
  profitLossAmount  Decimal?
  profitLossPercent Decimal?
  totalAssets       Decimal?
  reflectionGood    String?
  reflectionBad     String?
  reflectionImprove String?
  reflectionTags    String[]
  emotionBefore     Emotion?
  emotionDuring     Emotion?
  emotionAfter      Emotion?
  emotionNote       String?
  learningNote      String?
  learningCategory  LearningCategory?
  riskNotes         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  trades      Trade[]
  watchStocks WatchStock[]
  buyPlans    BuyPlan[]
  sellPlans   SellPlan[]
  stopLosses  StopLoss[]
}

model Trade {
  id          String    @id @default(uuid())
  diaryId     String
  stockCode   String
  stockName   String
  direction   TradeDirection
  price       Decimal
  quantity    Int
  amount      Decimal
  reason      String?
  strategyTag String?
  createdAt   DateTime  @default(now())

  diary Diary @relation(fields: [diaryId], references: [id], onDelete: Cascade)
}

model WatchStock {
  id          String     @id @default(uuid())
  diaryId     String
  stockCode   String
  stockName   String
  watchReason String?
  watchLevel  WatchLevel @default(NORMAL)
  techPosition String?
  createdAt   DateTime   @default(now())

  diary Diary @relation(fields: [diaryId], references: [id], onDelete: Cascade)
}

model BuyPlan {
  id              String   @id @default(uuid())
  diaryId         String
  stockCode       String
  stockName       String
  targetPrice     Decimal
  positionPercent Decimal
  buyReason       String?
  triggerCondition String?
  createdAt       DateTime @default(now())

  diary Diary @relation(fields: [diaryId], references: [id], onDelete: Cascade)
}

model SellPlan {
  id              String   @id @default(uuid())
  diaryId         String
  stockCode       String
  stockName       String
  targetPrice     Decimal
  sellPercent     Decimal
  sellReason      String?
  triggerCondition String?
  createdAt       DateTime @default(now())

  diary Diary @relation(fields: [diaryId], references: [id], onDelete: Cascade)
}

model StopLoss {
  id         String   @id @default(uuid())
  diaryId    String
  stockCode  String
  stockName  String
  stopPrice  Decimal
  costPrice  Decimal?
  stopReason String?
  createdAt  DateTime @default(now())

  diary Diary @relation(fields: [diaryId], references: [id], onDelete: Cascade)
}

model Tag {
  id         String      @id @default(uuid())
  userId     String
  name       String
  color      String      @default("#1890FF")
  category   TagCategory
  usageCount Int         @default(0)
  createdAt  DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, name])
}

// Enums
enum MarketTrend {
  SURGE      // 大涨
  RISE       // 小涨
  FLAT       // 平盘
  DROP       // 小跌
  PLUNGE     // 大跌
}

enum MarketVolume {
  HIGH       // 放量
  LOW        // 缩量
  NORMAL     // 平量
}

enum TradeDirection {
  BUY
  SELL
}

enum WatchLevel {
  HIGH       // 重点关注
  NORMAL     // 一般关注
  LOW        // 观察
}

enum Emotion {
  EXCITED    // 兴奋
  CALM       // 平静
  ANXIOUS    // 焦虑
  FEARFUL    // 恐惧
  GREEDY     // 贪婪
}

enum LearningCategory {
  TECHNICAL  // 技术分析
  FUNDAMENTAL // 基本面
  PSYCHOLOGY // 交易心理
  MARKET     // 市场规律
  OTHER      // 其他
}

enum TagCategory {
  STRATEGY   // 策略标签
  SECTOR     // 板块标签
  REFLECTION // 反思标签
  CUSTOM     // 自定义
}
```

---

## 6. 开发环境配置

### 6.1 环境要求

- Node.js >= 18.x
- PostgreSQL >= 15
- pnpm >= 8.x (推荐)

### 6.2 环境变量

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/stock_diary"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000

# frontend/.env
VITE_API_BASE_URL="http://localhost:3000/api"
```

### 6.3 启动命令

```bash
# 安装依赖
cd frontend && pnpm install
cd backend && pnpm install

# 初始化数据库
cd backend && pnpm prisma migrate dev

# 启动开发服务
cd backend && pnpm dev    # 后端 :3000
cd frontend && pnpm dev   # 前端 :5173
```

---

## 7. 部署方案

### 7.1 Docker部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stock_diary
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/stock_diary
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 8. 下一步开发计划

1. **初始化项目** - 创建前后端项目骨架
2. **数据库迁移** - 执行Prisma迁移
3. **用户认证** - 实现注册/登录
4. **核心功能** - 今日总结、明日计划
5. **历史回顾** - 日历视图、列表视图
6. **统计分析** - 图表展示

---

**文档变更记录**

| 版本 | 日期 | 修改内容 |
|-----|------|---------|
| v1.0 | 2026-01-26 | 初稿创建 |
