// routes/authRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Rota para registro de usuários com validação e sanitização
router.post('/register', [
  check('username').trim().escape().notEmpty().withMessage('Username é obrigatório'),
  // Garantir que o ponto seja preservado em e-mails
  check('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email inválido'),
  check('password').isLength({ min: 6 }).trim().escape().withMessage('A senha deve ter pelo menos 6 caracteres')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, register);

// Rota para login de usuários com validação e sanitização
router.post('/login', [
  // Garantir que o ponto seja preservado em e-mails
  check('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email inválido'),
  check('password').notEmpty().trim().escape().withMessage('Senha é obrigatória')
], (req, res, next) => {
  console.log('E-mail recebido no backend:', req.body.email);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, login);

module.exports = router;
