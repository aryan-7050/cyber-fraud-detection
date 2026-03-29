const express = require('express');
const router = express.Router();
const {
    createTransaction,
    getUserTransactions,
    getTransactionById,
    getFraudAlerts,
    getTransactionStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validationMiddleware');

// Make sure all controller functions exist
router.use(protect); // All routes require authentication

router.post('/', validateTransaction, createTransaction);
router.get('/', getUserTransactions);
router.get('/alerts', getFraudAlerts);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);

module.exports = router;