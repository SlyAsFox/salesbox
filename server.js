const dotenv = require('./dotenv');
const http = require('http');
const app = require('./app');
const sequelize = require('./sequelize');

const server = http.createServer(app);

sequelize.authenticate()
    .then( () => {
       server.listen(dotenv.parsed.PORT);
       console.log(`Server started at PORT: ${dotenv.parsed.PORT}`)
    });