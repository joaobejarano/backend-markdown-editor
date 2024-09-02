const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Recebendo dados para registro:', req.body);

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Usuário já existe:', email);
      return res.status(409).json({ message: 'Usuário já existe.' });
    }

    // Cria o usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    console.log('Usuário criado com sucesso:', user);

    // Retorna o usuário criado
    return res.status(201).json({ message: 'Usuário registrado com sucesso.', user });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Tentativa de login para:", email);

    // Encontrar usuário pelo e-mail
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Usuário não encontrado:", email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Comparar a senha fornecida com a senha criptografada no banco de dados
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Senha inválida para usuário:", email);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gerar token JWT
    // const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    //   expiresIn: '1h',
    // });
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });


    console.log("Login bem-sucedido, gerando token para:", email);

    res.json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
};

module.exports = {
  register,
  login,
};
