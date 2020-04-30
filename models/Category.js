const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Category extends Model {}

Category.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalURL: {
        type: DataTypes.STRING,
        field: 'original_url',
        allowNull: false
    },
    previewURL: {
        type: DataTypes.STRING,
        field: 'preview_url',
        allowNull: false
    },
    parentId: {
        type: DataTypes.INTEGER,
        field: 'parent_id',
        allowNull: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: false
    },
},{
    sequelize,
    modelName: 'categories',
    underscored: true,
    timestamps: false,
    defaultScope: {
        attributes: { exclude: ['parent_id'] }
    }
});

Category.associate = ( models ) => {
    Category.belongsTo( models.Company );
    Category.hasOne( models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
    } );
    Category.hasMany( models.Offer );
};

module.exports = Category;