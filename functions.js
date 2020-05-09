module.exports = {
    createCategoryID : ( existIds ) => {

        let ID = null;

        let unique = false;
        while( !unique ){
            const ID = Math.floor(Math.random() * 1000000000);

            let exist = existIds.find( item => item === ID);

            if( !exist ){
                return ID
            }
        }
    },
    createOfferID : ( existIds ) => {

        let ID = null;

        let unique = false;
        while( !unique ){
            const ID = Math.floor(Math.random() * 1000000000);

            let exist = existIds.find( item => item === ID);

            if( !exist ){
                return ID
            }
        }
    },
}