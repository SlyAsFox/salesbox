const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Company, Category } = require('../../../../models');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const sequelize = require('../../../../sequelize');

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

router.get('/:id/synchronization', asyncHandler(async (req, res) => {
    let data = null;
    const company = await Company.findOne({
        where: {
            id: req.params.id
        }
    })

    if ( company ){
        await axios.get(company.ymlURL_RU)
            .then( (response) => {
                parseString(response.data, (err, result) => {
                    data = result.yml_catalog
                });
            })
            .catch( (err) => {
                console.log(`[AXIOS ERROR]: ${err}`)
            });

        const categories = data.shop[0].categories[0].category
        const offers = data.shop[0].offers[0].offer

        let testCategory = categories[0];

        // res.send(categories);
        const syncTransaction = await sequelize.transaction();
        try {
            for(let category of categories){
                const findCategory = await Category.findOne({
                    where: {
                        companyId : company.id,
                        name: category._,
                    }
                }, {transaction: syncTransaction});

                if( findCategory ){
                    await findCategory.update({
                        companyId : company.id,
                        name: category._,
                        parentId: (category.$.parentId) ? category.$.parentId : null
                    }, {transaction: syncTransaction})
                }else{
                    await Category.create({
                        companyId : company.id,
                        name: category._,
                        parentId: (category.$.parentId) ? category.$.parentId : null
                    }, {transaction: syncTransaction})
                }
            }

            await syncTransaction.commit()
                .then( () => {
                    res.send({
                        status: 'SYNCHRONIZATION SUCCESS',
                        synchronized: {
                            categories: categories.length
                        }
                    })
                })
        } catch (err) {
            await syncTransaction.rollback()
                .then( (err) => {
                    console.log(`[SYNCHRONIZATION Transaction ERROR]: ${err}`);
                    res.send({
                        status: 'SYNCHRONIZATION ERROR'
                    })
                })
        }
    } else {
        throw new Error(`[synchronization get company by id: ${req.params.id}]`)
    }
}));

module.exports = router;