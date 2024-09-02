const request = require('supertest');
const { app } = require('../../index');  // Certifique-se de que o app está sendo importado corretamente
const { sequelize, User } = require('../../models');  // Importa o modelo User e sequelize

// Antes de rodar qualquer teste, sincronize o banco e garanta que ele seja limpo
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Limpa o banco de dados e sincroniza antes de cada teste
beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });
});

// Após todos os testes, feche a conexão com o banco de dados
afterAll(async () => {
  await sequelize.close();
});

describe('Auth Controller', () => {
  test('Deve registrar um novo usuário', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  test('Deve falhar ao registrar um usuário existente', async () => {
    await User.create({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });
  
    const response = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });
  
    expect(response.statusCode).toBe(409);  // Corrigido para 409
    expect(response.body).toHaveProperty('message', 'Usuário já existe.');
  });

  test('Deve fazer login com sucesso', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'loginuser',
      email: 'loginuser@example.com',
      password: 'password123'
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'loginuser@example.com',
      password: 'password123'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('Deve falhar ao fazer login com credenciais erradas', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'wronguser@example.com',
      password: 'wrongpassword'
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Credenciais inválidas.');
  });
});
