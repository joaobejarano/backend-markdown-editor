// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');
const { Server } = require('socket.io');  // Importa o Server do Socket.IO
require('dotenv').config();

const app = express();
const server = http.createServer(app);  // Cria um servidor HTTP usando Express
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Permite conexões CORS apenas do frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
})();

// Configurações do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  // Exemplo de um evento customizado
  socket.on('textChange', (data) => {
    // Broadcast para todos os outros clientes conectados
    socket.broadcast.emit('updateText', data);
  });
});

// Importando as rotas
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Middleware para tratar rotas inexistentes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Middleware para tratar erros internos
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});
