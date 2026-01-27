import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All account routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/accounts
 * @desc    Get all trading accounts
 * @access  Private
 */
router.get('/', AccountController.getAccounts);

/**
 * @route   POST /api/accounts
 * @desc    Create a new trading account
 * @access  Private
 */
router.post('/', AccountController.createAccount);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get a single trading account
 * @access  Private
 */
router.get('/:id', AccountController.getAccount);

/**
 * @route   GET /api/accounts/:id/stats
 * @desc    Get account statistics
 * @access  Private
 */
router.get('/:id/stats', AccountController.getAccountStats);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update a trading account
 * @access  Private
 */
router.put('/:id', AccountController.updateAccount);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete a trading account
 * @access  Private
 */
router.delete('/:id', AccountController.deleteAccount);

export default router;
