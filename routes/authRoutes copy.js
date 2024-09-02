// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rota para registro de usuários
router.post('/register', register);

// Rota para login de usuários
router.post('/login', login);

module.exports = router;
