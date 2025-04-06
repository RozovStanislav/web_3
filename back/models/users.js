// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
      username: {
          type: DataTypes.STRING,
          allowNull: false
      },
      email: {
          type: DataTypes.STRING,
          allowNull: false
      },
      password_hash: {
          type: DataTypes.STRING,
          allowNull: false
      }
  });
  return User;
};

// models/item.js
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
      name: {
          type: DataTypes.STRING,
          allowNull: false
      },
      description: {
          type: DataTypes.TEXT
      }
  });
  return Item;
};

// models/exchange_request.js
module.exports = (sequelize, DataTypes) => {
  const ExchangeRequest = sequelize.define('ExchangeRequest', {
      status: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              isIn: [['pending', 'accepted', 'declined']]
          }
      }
  });
  return ExchangeRequest;
};
