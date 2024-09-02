// routes/documentRoutes.js
const express = require('express');
const { Document } = require('../models');
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

// Rota para criar um novo documento
router.post('/', createDocument);

// Rota para recuperar um documento pelo ID
router.get('/:id', getDocument);

// Rota para recuperar todos os documentos (nova rota)
router.get('/', getAllDocuments);

// Rota para atualizar um documento existente pelo ID
router.put('/:id', updateDocument);

// Rota para criar uma nova versão do documento
router.post('/:documentId/version', createDocumentVersion);

// Rota para recuperar o histórico de versões de um documento
router.get('/:documentId/history', getDocumentHistory);

router.post('/:documentId/saveVersion', saveVersion);

module.exports = router;
