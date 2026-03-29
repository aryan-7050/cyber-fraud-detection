const Transaction = require('../models/Transaction');
const User = require('../models/User');
const FraudDetectionEngine = require('../utils/fraudDetection');

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        const transactionData = {
            ...req.body,
            user: req.user.id,
            timestamp: new Date(),
            status: 'pending'
        };
        
        // Get user's transaction history
        const userTransactions = await Transaction.find({ user: req.user.id })
            .sort({ timestamp: -1 })
            .limit(100);
        
        // Run fraud detection
        const fraudAnalysis = await FraudDetectionEngine.analyzeTransaction(
            transactionData,
            req.user,
            userTransactions
        );
        
        // Add fraud analysis results to transaction
        transactionData.fraudScore = fraudAnalysis.fraudScore;
        transactionData.riskLevel = fraudAnalysis.riskLevel;
        transactionData.isFraudulent = fraudAnalysis.isFraudulent;
        transactionData.fraudReason = fraudAnalysis.fraudReason;
        
        // Determine final status
        if (fraudAnalysis.shouldBlock) {
            transactionData.status = 'flagged';
        } else {
            transactionData.status = 'completed';
        }
        
        // Create transaction
        const transaction = await Transaction.create(transactionData);
        
        // Update user's fraud score if transaction is fraudulent
        if (transaction.isFraudulent) {
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { fraudScore: transaction.fraudScore }
            });
        }
        
        res.status(201).json({
            success: true,
            transaction,
            fraudAlert: transaction.isFraudulent ? {
                isFraudulent: true,
                riskLevel: transaction.riskLevel,
                reasons: transaction.fraudReason,
                score: transaction.fraudScore
            } : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, isFraudulent } = req.query;
        
        const query = { user: req.user.id };
        if (status) query.status = status;
        if (isFraudulent !== undefined) query.isFraudulent = isFraudulent === 'true';
        
        const transactions = await Transaction.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Transaction.countDocuments(query);
        
        res.json({
            success: true,
            transactions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        // Check if user owns transaction or is admin
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get fraud alerts
// @route   GET /api/transactions/alerts
// @access  Private
const getFraudAlerts = async (req, res) => {
    try {
        const alerts = await Transaction.find({
            user: req.user.id,
            isFraudulent: true
        }).sort({ timestamp: -1 }).limit(20);
        
        res.json({
            success: true,
            alerts,
            count: alerts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
    try {
        const totalTransactions = await Transaction.countDocuments({ user: req.user.id });
        const totalAmount = await Transaction.aggregate([
            { $match: { user: req.user._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const fraudCount = await Transaction.countDocuments({
            user: req.user.id,
            isFraudulent: true
        });
        
        const transactionsByRisk = await Transaction.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalTransactions,
                totalAmount: totalAmount[0]?.total || 0,
                fraudCount,
                fraudPercentage: totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0,
                riskDistribution: transactionsByRisk
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createTransaction,
    getUserTransactions,
    getTransactionById,
    getFraudAlerts,
    getTransactionStats
};