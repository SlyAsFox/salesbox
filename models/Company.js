const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Company extends Model {}

Company.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ymlURL_UA: {
        type: DataTypes.STRING,
        field: 'yml_url_ua',
        allowNull: true
    },
    ymlURL_RU: {
        type: DataTypes.STRING,
        field: 'yml_url_ru',
        allowNull: true
    },
    firebaseId: {
        type: DataTypes.STRING,
        field: 'firebase_id',
        allowNull: true
    }
},{
    sequelize,
    modelName: 'companies',
    underscored: true,
    timestamps: false,
    // defaultScope: {
    //     attributes: { exclude: ['id'] }
    // }
});

// Company.associate = ( models ) => {
    // Company.hasMany( models.Category );
// };

module.exports = Company;
