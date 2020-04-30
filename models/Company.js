const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Company extends Model {}

Company.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ymlURL: {
        type: DataTypes.STRING,
        field: 'yml_url',
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

Company.associate = ( models ) => {
    Company.hasMany( models.Category );
};

module.exports = Company;
