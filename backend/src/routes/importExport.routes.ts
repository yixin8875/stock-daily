import { Router } from 'express';
import multer from 'multer';
import { ImportExportController } from '../controllers/importExport.controller';
import { authMiddleware } from '../middlewares';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

/**
 * @swagger
 * /data/import/csv:
 *   post:
 *     summary: 导入CSV交易数据
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 导入成功 }
 */
router.post('/import/csv', ImportExportController.importCSV);

/**
 * @swagger
 * /data/import/excel:
 *   post:
 *     summary: 导入Excel交易数据
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 导入成功 }
 */
router.post('/import/excel', upload.single('file'), ImportExportController.importExcel);

/**
 * @swagger
 * /data/export/csv:
 *   get:
 *     summary: 导出交易数据为CSV
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回CSV文件 }
 */
router.get('/export/csv', ImportExportController.exportCSV);

/**
 * @swagger
 * /data/export/excel:
 *   get:
 *     summary: 导出交易数据为Excel
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回Excel文件 }
 */
router.get('/export/excel', ImportExportController.exportExcel);

/**
 * @swagger
 * /data/export/positions:
 *   get:
 *     summary: 导出持仓数据
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回CSV文件 }
 */
router.get('/export/positions', ImportExportController.exportPositions);

/**
 * @swagger
 * /data/export/watchlist:
 *   get:
 *     summary: 导出自选股数据
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回CSV文件 }
 */
router.get('/export/watchlist', ImportExportController.exportWatchlist);

/**
 * @swagger
 * /data/export/all:
 *   get:
 *     summary: 导出所有数据为Excel
 *     tags: [数据导入导出]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回Excel文件 }
 */
router.get('/export/all', ImportExportController.exportAll);

export default router;
