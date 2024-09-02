// routes/documentRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { 
  createDocument, 
  getAllDocuments,
  saveVersion,
  getDocument, 
  updateDocument, 
  createDocumentVersion, 
  getDocumentHistory 
} = require('../controllers/documentController');
const router = express.Router();

// Middleware de validação e sanitização
const validateDocument = [
  check('content').trim().escape(),
  check('version').isInt({ min: 1 }).withMessage('Versão deve ser um número inteiro positivo')
];

// Rota para criar um novo documento
router.post('/', validateDocument, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createDocument);

// Rota para recuperar um documento pelo ID
router.get('/:id', getDocument);

// Rota para recuperar todos os documentos
router.get('/', getAllDocuments);

// Rota para atualizar um documento existente pelo ID
router.put('/:id', validateDocument, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, updateDocument);

// Rota para criar uma nova versão do documento
router.post('/:documentId/version', createDocumentVersion);

// Rota para recuperar o histórico de versões de um documento
router.get('/:documentId/history', getDocumentHistory);

// Rota para salvar uma nova versão do documento e iniciar uma nova
router.post('/:documentId/saveVersion', saveVersion);

module.exports = router;
