const express = require('express');
const cors = require('cors');

const companiesRoutes = require('./routes/v1/companies');
const categoriesRoutes = require('./routes/v1/categories');
const synchronizationRoutes = require('./routes/v1/synchronization');

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

app.use('/v1/companies', companiesRoutes);
app.use('/v1/categories', categoriesRoutes);
app.use('/v1/synchronization', synchronizationRoutes);

app.use((error, req, res, next) => {
    res.send({
        error: error.message
    });
});

module.exports = app;
