// models/Document.js
module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Começa na versão 1
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: true,
    // Opções adicionais
    tableName: 'documents',
    indexes: [
      {
        unique: false,
        fields: ['version']
      }
    ]
  });

  return Document;
};
