import { Router } from 'express'
import { watchlistController } from '../controllers/watchlist.controller'

const router = Router()

router.get('/', watchlistController.getWatchlist)
router.post('/', watchlistController.addStock)
router.put('/:id', watchlistController.updateStock)
router.delete('/:id', watchlistController.removeStock)
router.post('/reorder', watchlistController.reorderStocks)

export default router
