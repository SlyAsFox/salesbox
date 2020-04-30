const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Company, Category } = require('../../../models');

router.get('/', asyncHandler(async (req, res) => {
    const companies = await Company.findAll();

    res.send({
        data: companies
    })
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const company = await Company.findAll({
        include: {
            model: Category,
            as: 'categories',
            include: {
                model: Category,
                as: 'parent'
            }
        },
        where: {
            id: req.params.id
        }
    });

    res.send({
        data: company
    })
}));

module.exports = router;