const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegistration } = require('../middleware/validationMiddleware');

// Make sure all controller functions exist
router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;