const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class OffersCategory extends Model {}

OffersCategory.init({
    categoryInternalId: {
        type: DataTypes.INTEGER,
        field: 'category_internal_id',
        allowNull: true
    },
    offerInternalId: {
        type: DataTypes.STRING,
        field: 'offer_internal_id',
        allowNull: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true
    }
},{
    sequelize,
        modelName: 'categories_offers',
        underscored: true,
        timestamps: false,
});

module.exports = OffersCategory;