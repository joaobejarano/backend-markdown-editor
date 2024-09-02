const request = require('supertest');
const { app } = require('../../index');  // Certifique-se de que o app está sendo importado corretamente
const { sequelize, Document, User } = require('../../models');  // Importa os modelos necessários

// Antes de rodar qualquer teste, sincronize o banco e garanta que ele seja limpo
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Limpa o banco de dados e sincroniza antes de cada teste
beforeEach(async () => {
  await Document.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });
});

// Após todos os testes, feche a conexão com o banco de dados
afterAll(async () => {
  await sequelize.close();
});



describe('Document Controller', () => {
  // Teste para criação de um novo documento
  test('Deve criar um novo documento', async () => {
    const userResponse = await request(app).post('/api/auth/register').send({
      username: 'docuser',
      email: 'docuser@example.com',
      password: 'password123'
    });
    // console.log('usuario', userResponse);
    const response = await request(app).post('/api/documents').send({
      content: 'Conteúdo inicial do documento',
      version: 1,
      createdBy: userResponse.body.user.id
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('content', 'Conteúdo inicial do documento');
  });


  test('Deve atualizar um documento existente', async () => {
    const user = await User.create({ username: 'docuser', email: 'docuser@example.com', password: 'password123' });
    const document = await Document.create({ content: 'Conteúdo original', version: 1, createdBy: user.username });

    const response = await request(app)
      .put(`/api/documents/${document.id}`)
      .send({ content: 'Conteúdo atualizado', version: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('content', 'Conteúdo atualizado');
  });

  test('Deve recuperar o histórico de versões', async () => {
    const user = await User.create({ username: 'docuser', email: 'docuser@example.com', password: 'password123' });
    const document = await Document.create({ content: 'Conteúdo original', version: 1, createdBy: user.username });
    
    await request(app).post(`/api/documents/${document.id}/version`);

    const response = await request(app).get(`/api/documents/${document.id}/history`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
