const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Currency extends Model {}

Currency.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    rate: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'currencies',
    underscored: true,
    timestamps: false,
    // defaultScope: {
    //     attributes: { exclude: ['id'] }
    // }
});

Currency.associate = ( models ) => {
    Currency.hasMany( models.Offer );
};

module.exports = Currency;