const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Category extends Model {}

Category.init({
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: false
    },
    nameRU: {
        type: DataTypes.STRING,
        field: 'name_ru',
        allowNull: false
    },
    nameUA: {
        type: DataTypes.STRING,
        field: 'name_ua',
        allowNull: false
    },
    originalURL: {
        type: DataTypes.STRING,
        field: 'original_url',
        allowNull: true
    },
    previewURL: {
        type: DataTypes.STRING,
        field: 'preview_url',
        allowNull: true
    },
    langSupport: {
        type: DataTypes.STRING,
        field: 'lang_support',
        allowNull: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        field: 'parent_id',
        allowNull: true
    }},{
        sequelize,
        modelName: 'categories',
        underscored: true,
        timestamps: false,
    }
)

Category.associate = ( models ) => {
    Category.belongsTo( models.Company );
    Category.hasOne( models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
    });

};

module.exports = Category;
/*

Category.associate = ( models ) => {
    Category.belongsTo( models.Company );
    Category.hasOne( models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
    } );
};


*/