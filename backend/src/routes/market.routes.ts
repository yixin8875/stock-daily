import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

// 龙虎榜
router.get('/dragon-tiger', MarketController.getDragonTiger);

// 机构交易
router.get('/institution-trades', MarketController.getInstitutionTrades);

// 北向资金流入
router.get('/north-flow', MarketController.getNorthFlow);

// 北向资金TOP股票
router.get('/north-top-stocks', MarketController.getNorthTopStocks);

// 板块列表
router.get('/sectors', MarketController.getSectors);

// 板块轮动
router.get('/sector-rotation', MarketController.getSectorRotation);

// 市场情绪
router.get('/sentiment', MarketController.getMarketSentiment);

// 资金流向
router.get('/money-flow', MarketController.getMoneyFlow);

export default router;
