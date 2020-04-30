const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Picture extends Model {}

Picture.init({
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    offerId: {
        type: DataTypes.INTEGER,
        field: 'offer_id',
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

Picture.associate = ( models ) => {
    Picture.belongsTo( models.Offer );
};

module.exports = Picture;