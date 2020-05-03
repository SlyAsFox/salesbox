const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Param extends Model {}

Param.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    offerId: {
        type: DataTypes.STRING,
        field: 'offer_id',
        allowNull: false
    },
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: false
    }
},{
    sequelize,
    modelName: 'params',
    underscored: true,
    timestamps: false,
    // defaultScope: {
    //     attributes: { exclude: ['id'] }
    // }
});

// Param.associate = ( models ) => {
//     Param.belongsTo( models.Offer );
// };

module.exports = Param;