import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Daily API',
      version: '1.0.0',
      description: '股票交易日记系统 API 文档',
      contact: {
        name: 'Stock Daily',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        Trade: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            stockCode: { type: 'string', example: '600519' },
            stockName: { type: 'string', example: '贵州茅台' },
            type: { type: 'string', enum: ['BUY', 'SELL'] },
            price: { type: 'number', example: 1800.5 },
            quantity: { type: 'integer', example: 100 },
            amount: { type: 'number', example: 180050 },
            commission: { type: 'number', example: 5 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Position: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            stockCode: { type: 'string' },
            stockName: { type: 'string' },
            quantity: { type: 'integer' },
            costPrice: { type: 'number' },
            totalCost: { type: 'number' },
            industry: { type: 'string' },
            targetPrice: { type: 'number' },
            stopPrice: { type: 'number' },
          },
        },
        Quote: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            change: { type: 'number' },
            changePercent: { type: 'number' },
            open: { type: 'number' },
            high: { type: 'number' },
            low: { type: 'number' },
            volume: { type: 'number' },
            amount: { type: 'number' },
          },
        },
        Signal: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            stockCode: { type: 'string' },
            stockName: { type: 'string' },
            signalType: { type: 'string', enum: ['MACD', 'KDJ', 'RSI', 'BOLL', 'MA'] },
            indicator: { type: 'string' },
            direction: { type: 'string', enum: ['BUY', 'SELL'] },
            price: { type: 'number' },
            description: { type: 'string' },
            triggeredAt: { type: 'string', format: 'date-time' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            stockCode: { type: 'string' },
            stockName: { type: 'string' },
            alertType: { type: 'string', enum: ['PRICE_ABOVE', 'PRICE_BELOW', 'TAKE_PROFIT', 'STOP_LOSS'] },
            targetPrice: { type: 'number' },
            isEnabled: { type: 'boolean' },
            isTriggered: { type: 'boolean' },
          },
        },
        Portfolio: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            initialCapital: { type: 'number' },
            currentValue: { type: 'number' },
            totalProfit: { type: 'number' },
            profitRate: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
