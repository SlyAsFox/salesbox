const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Offer extends Model {}

Offer.init({
    internalId: {
        type: DataTypes.STRING,
        field: 'internal_id',
        allowNull: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true
    },
    nameRU: {
        type: DataTypes.STRING,
        field: 'name_ru',
        allowNull: true
    },
    nameUA: {
        type: DataTypes.STRING,
        field: 'name_ua',
        allowNull: true
    },
    descriptionRU: {
        type: DataTypes.STRING,
        field: 'description_ru',
        allowNull: true
    },
    descriptionUA: {
        type: DataTypes.STRING,
        field: 'description_ua',
        allowNull: true
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    priceOld: {
        type: DataTypes.DOUBLE,
        field: 'price_old',
        allowNull: true,
    },
    pricePromo: {
        type: DataTypes.DOUBLE,
        field: 'price_promo',
        allowNull: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vendor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vendorCode: {
        type: DataTypes.STRING,
        field: 'vendor_code',
        allowNull: true,
    },
    countryOfOrigin: {
        type: DataTypes.STRING,
        field: 'country_of_origin',
        allowNull: true,
    },
    pickup: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    delivery: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        field: 'stock_quantity',
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_id',
        allowNull: true,
    },
    currencyId: {
        type: DataTypes.STRING,
        field: 'currency_id',
        allowNull: true,
    },
},{
    sequelize,
    modelName: 'offers',
    underscored: true,
    timestamps: false,
});

module.exports = Offer;