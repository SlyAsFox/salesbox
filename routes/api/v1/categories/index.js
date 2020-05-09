const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Category, Company } = require('../../../../models');

router.get('/', asyncHandler(async (req, res) => {
    const categories = await Category.findAll();

    res.send({
        data: categories
    })
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const category = await Category.findAll({
        where: {
            id: req.params.id
        }
    });

    res.send({
        data: category
    })
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const category = await Category.findAll({
        where: {
            id: req.params.id
        }
    });

    res.send({
        data: category
    })
}));
module.exports = router;