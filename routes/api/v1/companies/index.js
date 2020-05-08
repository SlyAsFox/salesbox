const { Router } = require('express');
const router = new Router();
const asyncHandler = require('express-async-handler');
const { Company, Category, Offer, Picture, Param, OffersCategory, Currency } = require('../../../../models');
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

router.get('/:id/categories/get-category/:categoryId', asyncHandler(async (req, res) => {
    const company = await Company.findOne({
        include: {
            model: Category,
            where: {
                internalId: req.params.categoryId
            }
        },
        where: {
            id: req.params.id
        }
    });
    const category = company.categories[0]
    // const category = company.categories[0];
    // const category = company.categories.find( category => category.internalId === req.params.categoryId.toString());

    res.send({
        data: category
    })
}));

//Synchronization function
router.get('/:id/synchronization', asyncHandler(async (req, res) => {
    const syncStart = new Date().getTime();
    const result = {
        status: null,
        time: null
    }
    const company = await Company.findOne({
        where: {
            id: req.params.id
        }
    })

    if ( company ){
        const syncTransaction = await sequelize.transaction();
        let dataRU = null;
        let dataUA = null;

        try {
            //get data from URLs
            if (company.ymlURL_RU) {
                await axios.get(company.ymlURL_RU)
                    .then((response) => {
                        parseString(response.data, (err, result) => {
                            dataRU = result[Object.keys(result)[0]]
                            // res.send(dataRU)
                        });
                    })
                    .catch((error) => {
                        console.log(`[AXIOS RU ERROR]: ${error}`)
                        throw error;
                    });
            }
            if (company.ymlURL_UA) {
                await axios.get(company.ymlURL_UA)
                    .then((response) => {
                        parseString(response.data, (err, result) => {
                            // let k = Object.keys(result)[0];
                            dataUA = result[Object.keys(result)[0]]
                            // res.send(result);
                        });
                    })
                    .catch((error) => {
                        console.log(`[AXIOS UA ERROR]: ${error}`)
                        throw error;
                    });
            }


            const categoriesRU = (dataRU.shop) ? dataRU.shop[0].categories[0].category : null;
            const offersRU = (dataRU.shop) ? dataRU.shop[0].offers[0].offer : null;

            let categoriesUA = null;
            let offersUA = null;

            if(dataUA){
                categoriesUA = (dataUA.shop) ? dataUA.shop[0].categories[0].category : null;
                offersUA = (dataUA.shop) ? dataUA.shop[0].offers[0].offer : null;
            }

            const currenciesRU = (dataRU.shop[0].currencies[0].currency) ? dataRU.shop[0].currencies[0].currency : null


            if(currenciesRU){
                await Currency.destroy({
                    where: {
                        companyId: company.id
                    }
                })
                const newCurrencies = [];
                for(let currency of currenciesRU){
                    newCurrencies.push({
                        companyId: company.id,
                        internalId: currency.$.id,
                        rate: currency.$.rate
                    });
                }
                Currency.bulkCreate(newCurrencies, {transaction: syncTransaction})
            }else{
                result.currencies = 'currencies not found'
            }

            const dbCategories = await Category.findAll({
                where: {
                    companyId: company.id
                },
                order: [
                    ['internalId', 'ASC']
                ],
                raw: true
            }, {transaction: syncTransaction});

            await Category.destroy({
                where: {
                    companyId: company.id
                }
            }, {transaction: syncTransaction})

            const newCategories = [];

            for(let categoryRU of categoriesRU) {
                const dbCategory = dbCategories.find(category => category.internalId == categoryRU.$.id);
                let uaCategory = getUA(categoriesUA, categoryRU.$.id)
                newCategories.push({
                    companyId: company.id,
                    internalId: categoryRU.$.id,
                    nameRU: categoryRU._,
                    parentId: (categoryRU.$.parentId) ? categoryRU.$.parentId : null,
                    originalURL: ( dbCategory ) ? dbCategory.originalURL : null,
                    previewURL: ( dbCategory ) ? dbCategory.previewURL : null,
                    nameUA: ( uaCategory ) ? uaCategory._ : null,
                    langSupport: ( uaCategory ) ? 'all' : 'ru'
                });
            }
            await Category.bulkCreate(newCategories, {
                transaction: syncTransaction
            });

            await Offer.destroy({
                where: {
                    companyId: company.id
                }
            }, {transaction: syncTransaction})
            await Param.destroy({
                where: {
                    companyId: company.id
                }
            }, {transaction: syncTransaction})
            await Picture.destroy({
                where: {
                    companyId: company.id
                }
            }, {transaction: syncTransaction})
            await OffersCategory.destroy({
                where: {
                    companyId: company.id
                }
            }, {transaction: syncTransaction})

            const newOffers = [];
            const newPictures = [];
            const newParams = [];
            const newCategoryOffers = [];

            for(let offerRU of offersRU) {
                let uaOffer = getUA(offersUA, offerRU.$.id)
                newOffers.push({
                    internalId: offerRU.$.id,
                    companyId: company.id,
                    available: (offerRU.$.available) ? offerRU.$.available : false,
                    nameRU: ( offerRU.name ) ? offerRU.name[0] : null,
                    nameUA: ( uaOffer ) ? uaOffer.name[0] : null,
                    descriptionRU: (offerRU.description) ? offerRU.description[0] : null,
                    descriptionUA: ( uaOffer ) ? uaOffer.description[0] : null,
                    price: (offerRU.price) ? offerRU.price[0] : null,
                    priceOld: (offerRU.price_old) ? offerRU.price_old[0] : null,
                    pricePromo: ( offerRU.price_promo ) ? offerRU.price_promo[0] : null,
                    url: (offerRU.url) ? offerRU.url[0] : null,
                    vendor: (offerRU.vendor) ? offerRU.vendor[0] : null, //null
                    currencyId: (offerRU.currencyId) ? offerRU.currencyId[0] : null,
                    vendorCode: (offerRU.vendor_code) ? offerRU.vendor_code[0] : null,
                    model: (offerRU.model) ? offerRU.model[0] : null,
                    stockQuantity: (offerRU.stock_quantity) ? offerRU.stock_quantity[0] : null,
                    pickup: (offerRU.pickup) ? offerRU.pickup[0] : null,
                    delivery: (offerRU.delivery) ? offerRU.delivery[0] : null,
                    countryOfOrigin: (offerRU.country_of_origin) ? offerRU.country_of_origin[0] : null
                });

                newCategoryOffers.push({
                    categoryInternalId: (offerRU.categoryId) ? offerRU.categoryId[0] : null,
                    offerInternalId: offerRU.$.id,
                    companyId: company.id
                })

                for(let pictureURL of offerRU.picture){
                    newPictures.push({
                        url: pictureURL,
                        offerId: offerRU.$.id,
                        companyId: company.id
                    })
                }
                if(offerRU.param){
                    for(let param of offerRU.param){
                        newParams.push({
                            offerId: offerRU.$.id,
                            companyId: company.id,
                            name: param.$.name,
                            unit: (param.$.unit) ? param.$.unit : null,
                            value: param._
                        })
                    }
                }
            }
            await Offer.bulkCreate(newOffers, {
                transaction: syncTransaction
            });
            await Picture.bulkCreate(newPictures, {
                transaction: syncTransaction
            });
            await Param.bulkCreate(newParams, {
                transaction: syncTransaction
            });
            await OffersCategory.bulkCreate(newCategoryOffers, {
                transaction: syncTransaction
            });

            await syncTransaction.commit()
                .then( () => {
                    result.time = millisToTime(new Date().getTime() - syncStart);
                    result.status = `[SYNCHRONIZATION SUCCESS] Company with id(${req.params.id}) synchronized`;
                    res.send(result);
                })

        }catch ( error ) {
            await syncTransaction.rollback()
            result.time = millisToTime(new Date().getTime() - syncStart);
            result.status = `ERROR : Transaction error ${error}`;
            console.log(`********************\nCATCH ERROR\n${error}\nline: ${error.lineNumber}\n********************`)
            res.send(result);
        }
    } else {
        const syncEnd = new Date().getTime();
        result.time = millisToTime(syncEnd - syncStart);
        result.status = `[SYNCHRONIZATION ERROR] : Company with id(${req.params.id}) not found`;
        res.send(result);
    }
    function getUA(arr, id){
        if(arr){
            return arr.find(category => category.$.id === id)
        }
        return null
    }
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

router.get('/:id/getKeys', asyncHandler(async (req, res) => {
    const company = await Company.findOne({
        where: {
            id: req.params.id
        }
    })

    if ( company ){
        if( company.ymlURL_RU ) {
            //get data from url RU
            let data = null;
            await axios.get(company.ymlURL_RU)
                .then((response) => {
                    parseString(response.data, (err, result) => {
                        res.send(unique(result.yml_catalog.shop[0].offers[0].offer));
                        // res.send(result.yml_catalog)//get all catalog
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
    }else{
        res.send('Company not found')
    }

    function unique(arr){
        const result = [];
        for(let obj of arr){
            let keys = Object.keys(obj);
            for(let key of keys){
                if (!result.includes(key)) {
                    result.push(key);
                }
            }
        }
        return result;
    }
}));



module.exports = router;