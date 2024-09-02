// controllers/documentController.js
const { Document } = require('../models');
const { Op } = require('sequelize');

// Cria um novo documento
const createDocument = async (req, res) => {
  try {
    const { content, version, createdBy } = req.body;
    const document = await Document.create({ content, version, createdBy });
    res.status(201).json(document);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ message: 'Erro ao criar documento.' });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll();
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
};

const saveVersion = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    // Salva a versão atual como uma nova versão
    await Document.create({
      content: document.content,
      version: document.version + 1,
      createdBy: document.createdBy,
    });

    // Reseta o conteúdo e incrementa a versão do documento atual
    document.content = ''; // Reseta o conteúdo para iniciar uma nova versão
    document.version += 1;
    await document.save();

    res.status(200).json({ message: 'Nova versão salva e iniciada', document });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar nova versão', error });
  }
};

// Recupera um documento pelo ID
const getDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }
    res.status(200).json(document);
  } catch (error) {
    console.error('Erro ao recuperar documento:', error);
    res.status(500).json({ message: 'Erro ao recuperar documento.' });
  }
};

// Atualiza um documento existente pelo ID
const updateDocument = async (req, res) => {
  try {
    const { content, version } = req.body;
    const documentId = req.params.id;  // Certifique-se de que o ID está vindo corretamente dos parâmetros da rota.
    
    if (!documentId) {
      return res.status(400).json({ message: 'ID do documento é necessário.' });
    }

    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }
    
    document.content = content;
    document.version = version;
    await document.save();
    
    res.status(200).json(document);
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({ message: 'Erro ao atualizar documento.' });
  }
};
// Cria uma nova versão do documento
const createDocumentVersion = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    // Cria uma nova versão do documento
    const newVersion = await Document.create({
      content: document.content,
      version: document.version + 1,
    });

    res.status(201).json(newVersion);
  } catch (error) {
    console.error('Erro ao criar nova versão do documento:', error);
    res.status(500).json({ message: 'Erro ao criar nova versão do documento.' });
  }
};

// Recupera o histórico de versões de um documento
const getDocumentHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const history = await Document.findAll({
      where: {
        id: {
          [Op.ne]: documentId
        }
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('Erro ao recuperar histórico do documento:', error);
    res.status(500).json({ message: 'Erro ao recuperar histórico do documento.' });
  }
};

module.exports = {
  createDocument,
  getAllDocuments,
  saveVersion,
  getDocument,
  updateDocument,
  createDocumentVersion,
  getDocumentHistory,
};
