import { Router } from 'express';
import multer from 'multer';
import { ImportExportController } from '../controllers/importExport.controller';
import { authMiddleware } from '../middlewares';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// 导入
router.post('/import/csv', ImportExportController.importCSV);
router.post('/import/excel', upload.single('file'), ImportExportController.importExcel);

// 导出
router.get('/export/csv', ImportExportController.exportCSV);
router.get('/export/excel', ImportExportController.exportExcel);

export default router;
