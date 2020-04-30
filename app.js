const express = require('express');
const cors = require('cors');

const companiesRoutes = require('./routes/api/v1/companies');
const categoriesRoutes = require('./routes/api/v1/categories');

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

app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/categories', categoriesRoutes);

app.use((error, req, res, next) => {
    res.send({
        error: error.message
    });
});

module.exports = app;
