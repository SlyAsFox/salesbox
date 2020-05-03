const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Company, Category, Offer, Picture, Param } = require('../../../../models');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const sequelize = require('../../../../sequelize');

function millisToTime(millis) {
    const min = Math.floor((millis/1000/60) << 0)
    const sec = ((millis / 1000) % 60).toFixed(2);
    return `${min}m ${sec}s`;
}

//GET all companies
router.get('/', asyncHandler(async (req, res) => {
    const companies = await Company.findAll();

    res.send({
        data: companies
    })
}));

//GET company by id
router.get('/:id', asyncHandler(async (req, res) => {
    const company = await Company.findAll({
        where: {
            id: req.params.id
        }
    });

    res.send({
        data: company
    })
}));

router.get('/:id/synchronization', asyncHandler(async (req, res) => {
    const syncStart = new Date().getTime();
    const result = {
        status: null,
        time: null,
        synchronized: {
            RU: {
                haveLink: false,
                categories: 0,
                offers: 0
            },
            UA: {
                haveLink: false,
                categories: 0,
                offers: 0
            }
        }
    }
    let data = null;
    const company = await Company.findOne({
        where: {
            id: req.params.id
        }
    })

    if ( company ){
        const syncTransaction = await sequelize.transaction();
        try {
            if(company.ymlURL_RU){
                //get data from url RU
                await axios.get(company.ymlURL_RU)
                    .then( (response) => {
                        parseString(response.data, (err, result) => {
                            data = result.yml_catalog
                        });
                    })
                    .catch( ( error ) => {
                        console.log(`[AXIOS ERROR]: ${error}`)
                        throw error;
                    });

                await Picture.destroy({
                    where: {
                        companyId: company.id
                    }
                }, {transaction: syncTransaction})
                await Param.destroy({
                    where: {
                        companyId: company.id
                    }
                }, {transaction: syncTransaction})

                const categories = data.shop[0].categories[0].category;
                const offers = data.shop[0].offers[0].offer;

                for(let category of categories){
                    const findCategory = await Category.findOne({
                        where: {
                            companyId : company.id,
                            internalId: category.$.id,
                        }
                    });

                    if( findCategory ){
                        await findCategory.update({
                            nameRU: category._,
                            parentId: (category.$.parentId) ? category.$.parentId : null
                        }, {transaction: syncTransaction})
                    }else{
                        await Category.create({
                            companyId : company.id,
                            internalId: category.$.id,
                            nameRU: category._,
                            parentId: (category.$.parentId) ? category.$.parentId : null
                        }, {transaction: syncTransaction})
                    }
                }

                for(let offer of offers) {
                    const findOffer = await Offer.findOne({
                        where: {
                            internalId: offer.$.id,
                            companyId: company.id
                        }
                    });

                    if ( findOffer ){
                        await findOffer.update({
                            available: offer.$.available,
                            nameRU: offer.name[0],
                            price: offer.price[0],
                            priceOld: offer.price_old[0],
                            pricePromo: offer.price_promo[0],
                            url: offer.url[0],
                            vendor: offer.vendor[0],
                            currencyId: offer.currencyId[0],
                            categoryId: offer.categoryId[0],
                            vendorCode: (offer.vendor_code) ? offer.vendor_code[0] : null,
                            model: (offer.model) ? offer.model[0] : null,
                            stockQuantity: (offer.stock_quantity) ? offer.stock_quantity[0] : null,
                            pickup: (offer.pickup) ? offer.pickup[0] : null,
                            delivery: (offer.delivery) ? offer.delivery[0] : null,
                            countryOfOrigin: (offer.country_of_origin) ? offer.country_of_origin[0] : null,
                            descriptionRU: offer.description[0]
                        }, {transaction: syncTransaction})
                    }else {
                        await Offer.create({
                            internalId: offer.$.id,
                            companyId: company.id,
                            available: offer.$.available,
                            nameRU: offer.name[0],
                            price: offer.price[0],
                            priceOld: offer.price_old[0],
                            pricePromo: offer.price_promo[0],
                            url: offer.url[0],
                            vendor: offer.vendor[0],
                            currencyId: offer.currencyId[0],
                            categoryId: offer.categoryId[0],
                            vendorCode: (offer.vendor_code) ? offer.vendor_code[0] : null,
                            model: (offer.model) ? offer.model[0] : null,
                            stockQuantity: (offer.stock_quantity) ? offer.stock_quantity[0] : null,
                            pickup: (offer.pickup) ? offer.pickup[0] : null,
                            delivery: (offer.delivery) ? offer.delivery[0] : null,
                            countryOfOrigin: (offer.country_of_origin) ? offer.country_of_origin[0] : null,
                            descriptionRU: offer.description[0]
                        }, {transaction: syncTransaction})
                    }
                    for(let pictureURL of offer.picture){
                        await Picture.create({
                            url: pictureURL,
                            offerId: offer.$.id,
                            companyId: company.id
                        })
                    }
                    for(let param of offer.param){
                        await Param.create({
                            offerId: offer.$.id,
                            companyId: company.id,
                            name: param.$.name,
                            unit: (param.$.unit) ? param.$.unit : null,
                            value: param._
                        })
                    }
                }
                result.synchronized.RU = {
                    haveLink: true,
                    categories: categories.length,
                    offers: offers.length
                }
            }

            if(company.ymlURL_UA){
                result.synchronized.UA.haveLink = true;
            }

            await syncTransaction.commit()
                .then( () => {
                    const syncEnd = new Date().getTime();
                    result.time = millisToTime(syncEnd - syncStart);
                    result.status = `[SYNCHRONIZATION SUCCESS] Company with id(${req.params.id}) synchronized`;
                    res.send(result);
                })
        }catch ( error ) {
            await syncTransaction.rollback()
                .then ( ( error ) => {
                    const syncEnd = new Date().getTime();
                    result.time = millisToTime(syncEnd - syncStart);
                    result.status = `ERROR : Transaction error ${error}`;
                    res.send(result);
                    throw error;
                })
        }


    } else {
        const syncEnd = new Date().getTime();
        result.time = millisToTime(syncEnd - syncStart);
        result.status = `[SYNCHRONIZATION ERROR] : Company with id(${req.params.id}) not found`;
        res.send(result);
    }
}));

//GET offer by id
router.get('/getOffer/:id', asyncHandler(async (req, res) => {
    const offer = await Offer.findOne({
        where: {
            id: req.params.id
        }
    });

    res.send({
        data: offer
    })
}));

router.get('/z/z/z', asyncHandler( async (req, res) => {
    let str = 'lll'
    await Offer.create({
        internal: 'qwe'
    });

    res.send('created')
}));

router.get('/:id/getParsedData/:lang', asyncHandler(async (req, res) => {
    const company = await Company.findOne({
        where: {
            id: req.params.id
        }
    })

    if ( company ){
        if( req.params.lang === 'ru' ){
            if( company.ymlURL_RU ) {
                //get data from url RU
                await axios.get(company.ymlURL_RU)
                    .then((response) => {
                        parseString(response.data, (err, result) => {
                            res.send(result.yml_catalog)//get all catalog
                            // res.send(result.yml_catalog.shop[0].offers[0].offer)// get array of offers
                            // res.send({
                            //     length: result.yml_catalog.shop[0].offers[0].offer.length
                            // })// get array of offers length
                            // res.send(result.yml_catalog.shop[0].offers[0].offer[1])// get first from array of offer
                            // res.send(Object.keys(result.yml_catalog.shop[0].offers[0].offer[0]))// get keys from 1 offer
                        });
                    })
                    .catch((err) => {
                        console.log(`[AXIOS ERROR]: ${err}`)
                    });
            }else{
                res.send('XML_RU URL not found')
            }
        }else if( req.params.lang === 'ua' ) {
            if (company.ymlURL_UA) {
                //get data from url RU
                await axios.get(company.ymlURL_UA)
                    .then((response) => {
                        parseString(response.data, (err, result) => {
                            res.send(result.yml_catalog)
                        });
                    })
                    .catch((err) => {
                        console.log(`[AXIOS ERROR]: ${err}`)
                    });
            } else {
                res.send('XML_RU URL not found')
            }
        }
    }else{
        res.send('Company not found')
    }
}));



module.exports = router;