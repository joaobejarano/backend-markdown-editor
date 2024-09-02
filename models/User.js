// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 100], // Exemplo de validação de tamanho
        },
      },
    },
    {
      timestamps: true,
      tableName: 'users', // Nome da tabela no banco de dados
    }
  );

  // Definição de associações, se necessário
  User.associate = (models) => {
    // Exemplo de associação:
    // User.hasMany(models.Post, { foreignKey: 'userId' });
  };

  return User;
};
