const models = {
    Company: require('./Company'),
    Category: require('./Category'),
    Currency: require('./Currency'),
    Offer: require('./Offer'),
    Param: require('./Param'),
    Picture: require('./Picture'),
    OffersCategory: require('./OffersCategory')
};

const modelNames = Object.keys(models);

modelNames.forEach( (modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;