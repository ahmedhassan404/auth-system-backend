const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');


router.get('/profile', authenticateJWT, userController.getProfile);

router.get('/login-history', authenticateJWT, userController.getLoginHistory);

module.exports = router;


