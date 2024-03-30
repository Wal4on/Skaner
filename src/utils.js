import fs from 'fs';


const utils = {};


utils.sort = (arr) => {
    for(let stageId = 0; stageId < arr.length - 1; stageId++) {
        var wasSwap = false;

        for(let elemId = 0; elemId < arr.length - 1 - stageId; elemId++) {
            if(arr[elemId].funding > arr[elemId + 1].funding) {
                var swap = arr[elemId];
                arr[elemId] = arr[elemId + 1];
                arr[elemId + 1] = swap;
                wasSwap = true;
            }
        }
        if (!wasSwap) break;
    }

    return arr;
};

utils.sortByExchange = (arr, exchange) => {
    for(const coin in arr) {
        let previousElem;

        for(const symbolKey in arr) {
            if(!arr[symbolKey][exchange]) continue;
            if(!previousElem) {
                previousElem = {
                    key: symbolKey,
                    funding: arr[symbolKey][exchange]
                };
               continue;
            }


            const funding = arr[symbolKey][exchange];
            if(previousElem.funding > funding) {
                let temp = arr[symbolKey];
                arr[symbolKey] = arr[previousElem.key]
                arr[previousElem.key] = temp;
            }

            previousElem = {
                key: symbolKey,
                funding: arr[symbolKey][exchange]
            };
        }
    }
    return arr;
};

utils.getExchanges = async () => {
    const exchanges = JSON.parse((await fs.promises.readFile('./config/exchanges.json')).toString());
    // console.log('exchanges :>> ', exchanges);
    return exchanges;
}


utils.transformData = (data) => {
    const transformedData = {};

    const exchangesList = [];

    for(const exchangeKey in data) {
        exchangesList.push(exchangeKey);
    }

    for (const exchange in data) {
        for (const item of data[exchange]) {
            const coin = item.coin;
            if (!transformedData[coin]) {
                transformedData[coin] = {};
                for(const uniqueExchange of exchangesList) {
                    transformedData[coin][uniqueExchange] = null;
                }
            }
            transformedData[coin][exchange] = item.funding;

            for(const uniqueExchange of exchangesList) {
                let isUnique = true;
                for(const exchangeKeyToCheck in transformedData[coin]) {
                    if(uniqueExchange === exchangeKeyToCheck) {
                        isUnique = false;
                        continue;
                    }
                }

                if(isUnique) transformedData[coin][uniqueExchange] = null;
            }
        }
    }

    return transformedData;
}

export {
    utils
}

