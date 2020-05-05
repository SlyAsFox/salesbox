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
            try{
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
            }catch (e) {
                console.log(`[1 - Parse data] ${e}`)
            }


            const categoriesRU = (dataRU.shop) ? dataRU.shop[0].categories[0].category : null;
            const offersRU = (dataRU.shop) ? dataRU.shop[0].offers[0].offer : null;
            const currenciesRU = (dataRU.shop[0].currencies[0].currency) ? dataRU.shop[0].currencies[0].currency : null
            const categoriesUA = (dataUA.shop) ? dataUA.shop[0].categories[0].category : null;
            const offersUA = (dataUA.shop) ? dataUA.shop[0].categories[0].category : null;


            try {
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
                }
            }catch (e) {
                console.log(`[3 - Currency insert] ${e}`)
            }

            try{
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
                    newCategories.push({
                        companyId: company.id,
                        internalId: categoryRU.$.id,
                        nameRU: categoryRU._,
                        parentId: (categoryRU.$.parentId) ? categoryRU.$.parentId : null,
                        originalURL: ( dbCategory ) ? dbCategory.originalURL : null,
                        previewURL: ( dbCategory ) ? dbCategory.previewURL : null,
                        nameUA: ( categoriesUA ) ? categoriesUA.find(category => category.$.id === categoryRU.$.id).name[0] : null,
                        langSupport: ( categoriesUA ) ? 'all' : 'ru'
                    });
                }

                await Category.bulkCreate(newCategories, {
                    transaction: syncTransaction
                });
            }catch (e) {
                console.log(`[4 - Categories insert] ${e}`)
            }

            try{
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
                    newOffers.push({
                        internalId: offerRU.$.id,
                        companyId: company.id,
                        available: (offerRU.$.available) ? offerRU.$.available : false,
                        nameRU: ( offerRU.name ) ? offerRU.name[0] : null,
                        nameUA: ( offersUA ) ? offersUA.find(offer => offer.$.id === offerRU.$.id).name[0] : null,
                        descriptionRU: (offerRU.description) ? offerRU.description[0] : null,
                        descriptionUA: ( offersUA ) ? offersUA.find(offer => offer.$.id === offerRU.description[0]).description[0] : null,
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
            }catch (e) {
                console.log(`[4 - Offers with params and pictures insert] ${e}`)
            }


            await syncTransaction.commit()
                .then( () => {
                    result.time = millisToTime(new Date().getTime() - syncStart);
                    result.status = `[SYNCHRONIZATION SUCCESS] Company with id(${req.params.id}) synchronized`;
                    res.send(result);
                })

        }catch( error ) {
            await syncTransaction.rollback()
                .then ( ( error ) => {
                    result.time = millisToTime(new Date().getTime() - syncStart);
                    result.status = `ERROR : Transaction error ${error}`;
                    res.send(result);
                    console.log('catch error' + error)
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

module.exports = router;