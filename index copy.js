// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');
const { Server } = require('socket.io');  // Importa o Server do Socket.IO
require('dotenv').config();
const jwt = require('jsonwebtoken');

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

// Gerenciamento de usuários conectados
const users = {};  // Objeto para armazenar os usuários conectados

// Configurações do Socket.IO
io.on('connection', (socket) => {
  const token = socket.handshake.auth.token;
  let user;
  
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('Token inválido:', err.message);
    socket.disconnect();
    return;
  }

  // Adiciona o usuário à lista de conectados
  users[socket.id] = user;

  // Informa aos outros clientes sobre o novo usuário conectado
  io.emit('userConnected', users);

  console.log('Novo cliente conectado:', user.username);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', user.username);
    delete users[socket.id];  // Remove o usuário da lista de conectados
    io.emit('userDisconnected', users);  // Atualiza a lista de usuários conectados
  });

  // Recebe o evento de alteração de texto e retransmite para todos os usuários conectados
  socket.on('textChange', (data) => {
    socket.broadcast.emit('updateText', data);
  });

  // Envia para o cliente a lista atual de usuários conectados
  socket.emit('userConnected', users);
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
