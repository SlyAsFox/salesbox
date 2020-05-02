const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class OffersCategory extends Model {}

OffersCategory.init({
    categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_internal_id',
        allowNull: true
    },
    offerId: {
        type: DataTypes.STRING,
        field: 'offer_internal_id',
        allowNull: true
    },
    isMain: {
        type: DataTypes.BOOLEAN,
        field: 'is_main',
        allowNull: true
    }
},{
    sequelize,
        modelName: 'categories_offers',
        underscored: true,
        timestamps: false,
});

module.exports = OffersCategory;