const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Currency extends Model {}

Currency.init({
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true
    },
    internalId: {
        type: DataTypes.STRING,
        field: 'internal_id',
        allowNull: true
    },
    rate: {
        type: DataTypes.STRING,
        allowNull: true
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

// Currency.associate = ( models ) => {
//     Currency.hasMany( models.Offer );
// };

module.exports = Currency;