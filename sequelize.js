const dotenv = require('./dotenv');
const Sequlize = require('sequelize');

const sequelize = new Sequlize(dotenv.parsed.DB_URL, {
   dialect: 'postgres',
   logging: console.log,
   benchmark: true
});

module.exports = sequelize;