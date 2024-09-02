const express = require('express');
const http = require('http'); // Inclua a importação de http
const cors = require('cors');
const { sequelize } = require('./models');
const { Server } = require('socket.io');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app); // Crie o servidor HTTP usando o Express

// Configuração do Socket.IO com o servidor HTTP
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

    if (process.env.NODE_ENV !== 'test') {
      const port = process.env.PORT || 4000;
      server.listen(port, () => { // Inicia o servidor HTTP (e Socket.IO)
        console.log(`Servidor rodando na porta ${port}`);
      });
    }
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

  // Inicializa o array de conexões se não existir
  if (!users[user.id]) {
    users[user.id] = { username: user.username, sockets: [] };
  }

  // Adiciona a conexão atual ao array de conexões do usuário
  users[user.id].sockets.push(socket.id);

  // Informa aos outros clientes sobre o novo usuário conectado
  io.emit('userConnected', getUsers());

  console.log('Novo cliente conectado:', socket.id);

  // Lida com o evento 'userEditing'
  socket.on('userEditing', (username) => {
    console.log(`${username} está editando...`); // Log no servidor para depuração
    socket.broadcast.emit('userEditing', username);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', user.username);
    // Remove a conexão atual do array de conexões do usuário
    users[user.id].sockets = users[user.id].sockets.filter(id => id !== socket.id);

    // Se o usuário não tiver mais conexões, remove-o da lista de usuários
    if (users[user.id].sockets.length === 0) {
      delete users[user.id];
    }

    io.emit('userDisconnected', getUsers());  // Atualiza a lista de usuários conectados
  });

  socket.on('textChange', (data) => {
    socket.broadcast.emit('updateText', data);
  });

  socket.emit('userConnected', getUsers());
});

// Função para gerar a lista de usuários conectados
function getUsers() {
  return Object.values(users).map(user => ({
    username: user.username,
  }));
}

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

module.exports = { app, server };
