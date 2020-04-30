const dotenv = require('./dotenv');
const Sequlize = require('sequelize');

const sequelize = new Sequlize(dotenv.parsed.DB_NAME, dotenv.parsed.DB_USERNAME, dotenv.parsed.DB_PASSWORD, {
   host: dotenv.parsed.DB_HOST,
   dialect: 'postgres',
   logging: console.log,
   benchmark: true
});

module.exports = sequelize;