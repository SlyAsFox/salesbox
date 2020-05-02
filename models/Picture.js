const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Picture extends Model {}

Picture.init({
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    offerId: {
        type: DataTypes.STRING,
        field: 'offer_internal_id',
        allowNull: false
    }
},{
    sequelize,
    modelName: 'pictures',
    underscored: true,
    timestamps: false,
    // defaultScope: {
    //     attributes: { exclude: ['id'] }
    // }
});

// Picture.associate = ( models ) => {
//     Picture.belongsTo( models.Offer );
// };

module.exports = Picture;