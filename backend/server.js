const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SIMPLE & WORKING CORS CONFIG
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://cyber-fraud-detection.vercel.app"
    ],
    credentials: true
}));

// ============= ROUTES =============

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cyber Fraud Detection System API',
        status: 'Server is running'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});