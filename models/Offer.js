const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Offer extends Model {}

Offer.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_id',
        allowNull: false
    },
    currencyId: {
        type: DataTypes.INTEGER,
        field: 'currency_id',
        allowNull: false
    },
    pickup: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    delivery: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vendor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vendorCode: {
        type: DataTypes.STRING,
        field: 'vendor_code',
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    countryOfOrigin: {
        type: DataTypes.STRING,
        field: 'country_of_origin',
        allowNull: false
    }
},{
    sequelize,
    modelName: 'offers',
    underscored: true,
    timestamps: false,
    // defaultScope: {
    //     attributes: { exclude: ['id'] }
    // }
});

Offer.associate = ( models ) => {
    Offer.hasMany( models.Param );
    Offer.hasMany( models.Picture );
    Offer.belongsTo( models.Currency );
    Offer.belongsTo( models.Category );
};

module.exports = Offer;