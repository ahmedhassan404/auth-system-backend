const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/github', authController.githubLogin);

router.get('/github/callback', authController.githubCallback);

router.get('/verify', authenticateJWT, authController.verifyToken);

router.post('/logout', authenticateJWT, authController.logout);

module.exports = router;