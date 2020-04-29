const express = require('express');
const cors = require('cors');

// const usersRoutes = require('./routes/api/v1/users');

const app = express();

app.use(cors());

const sequelize = require('./sequelize');

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send({
        data: 'Homepage'
    });
});

// app.use('/api/v1/users', usersRoutes);

app.use((error, req, res, next) => {
    res.send({
        error: error.message
    });
});

module.exports = app;