const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Category, Company } = require('../../../models');
const Sequelize = require('../../../sequelize');

router.get('/test', asyncHandler(async (req, res) => {
    const t = await Sequelize.transaction();

    try {
        await Company.create({
            name: 'Transaction TEST',
            ymlURL: 'Transaction TEST'
        }, {transaction: t})

        const category = await Category.create({
            company_id: 1,
            companyId: 1,
            name: 'Transaction TEST',
            originalURL: 'Transaction TEST',
            previewURL: 'Transaction TEST',
            parentId: 1
        }, {transaction: t})

        throw new Error('test error')

        await t.commit()
            .then( () => {
                res.send({
                    result: 'SYNCHRONIZATION SUCCESS'
                })
            })
    } catch (err) {
        await t.rollback()
            .then( (err) => {
                res.send({
                    result: 'SYNCHRONIZATION ERROR'
                })
            })
        console.log(`[SYNCHRONIZATION Transaction ERROR]: ${err}`);
    }
}));



module.exports = router;
