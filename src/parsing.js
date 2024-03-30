import axios from 'axios';
import { utils } from './utils.js';

const currentData = {};

const exchanges = await utils.getExchanges();
for (const exchange of exchanges) {
    currentData[exchange.title] = [];
}



const startParsing = async (exchanges) => {

    for (const exchange of exchanges) {
        if (Object.keys(parsingMethods).includes(exchange.title)) {
            parsingMethods[exchange.title](exchange);
        }
    }
}


async function makeGetRequest(path, params) {
    let requestPath;

    if (params === undefined)
        requestPath = `${path}`;
    else
        requestPath = `${path}?${Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;

    try {
        // console.log('req.path :>> ', requestPath);
        const response = await axios.get(requestPath);

        return response;
    } catch (error) {
        return;
        console.error('Error:', error.message);
    }
}




const parsingMethods = {
    'okx': async (exchange) => {
        try {
            const coinsResponse = await makeGetRequest(exchange.coins, {
                'instType': 'SPOT'
            });
            // console.log('coinsResponse :>> ', coinsResponse);
            const instrumentsObjectsList = coinsResponse.data.data;
            // console.log('instrumentsObjectsList :>> ', instrumentsObjectsList);
            const instruments = [];

            for (const instrumentObject of instrumentsObjectsList) {
                if (instrumentObject.instId[instrumentObject.instId.length - 1] !== 'T') continue;
                const instrumentFundingRateResponse = await makeGetRequest(exchange.funding, {
                    'instId': instrumentObject.instId + '-SWAP'
                });

                try {
                    if (instrumentFundingRateResponse.status === 200) {
                        const instrumentFundingRate = instrumentFundingRateResponse.data.data;
                        // console.log('instrumentFundingRate :>> ', instrumentFundingRate);

                        let isUpdated = false;
                        for (let currentDataExchangeIndex in currentData[exchange.title]) {
                            if (currentData[exchange.title][currentDataExchangeIndex].coin === instrumentObject.instId) {
                                currentData[exchange.title][currentDataExchangeIndex].funding = +(instrumentFundingRate[0].fundingRate * 100).toFixed(5);
                                currentData[exchange.title][currentDataExchangeIndex].time = new Date(+instrumentFundingRate[0].fundingTime - +instrumentFundingRate[0].ts).getHours();
                                isUpdated = true;
                            }
                            if (isUpdated) break;
                        }

                        if (!isUpdated) {
                            currentData[exchange.title].push({
                                coin: instrumentObject.instId.split('').map((letter) => {
                                    const alphabet = [
                                        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                                    ];

                                    for (const alphabetLetter of alphabet) {
                                        if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                                    }

                                    return '';
                                }).join(''),
                                funding: +(instrumentFundingRate[0].fundingRate * 100).toFixed(5)
                            });
                        }

                    }
                } catch (error) {
                    continue;
                    console.log('error.message :>> ', error.message);
                    console.log('instrumentFundingRateResponse :>> ', instrumentFundingRateResponse.data);
                }
            }

            currentData[exchange.title] = instruments;
        } catch (error) {
            console.log('err okx:>>', error.message);
        }
    },
    'binance': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbol: 'btc_usdt'
        });

        const symbolsObjects = symbolsResponse.data.symbols;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.symbol
                });

                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.symbol) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolFundingRateResponse.data.lastFundingRate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.symbol.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolFundingRateResponse.data.lastFundingRate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message binance:>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'bingx': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbols: 'btc_usdt'
        });

        const symbolsObjects = symbolsResponse.data.data;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.symbol
                });
                // console.log('symbolFundingRate :>> ', symbolFundingRateResponse.data.data.lastFundingRate);
                // symbols.push({
                //     coin: symbolObject.symbol,
                //     funding: +(symbolFundingRateResponse.data.result.fundingRate*100).toFixed(5),
                //     time: symbolFundingRateResponse.data.result.collectionInternal
                // });



                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.symbol) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolFundingRateResponse.data.data.lastFundingRate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.symbol.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolFundingRateResponse.data.data.lastFundingRate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message bingx:>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'bybit': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            category: 'linear'
        });

        const symbolsObjects = symbolsResponse.data.result.list;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.symbol,
                });
                // console.log('symbolFundingRate :>> ', symbolObject.fundingRate);
                // symbols.push({
                //     coin: symbolObject.symbol,
                //     funding: +(symbolFundingRateResponse.data.result.fundingRate*100).toFixed(5),
                //     time: symbolFundingRateResponse.data.result.collectionInternal
                // });



                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.symbol) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.fundingRate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.symbol.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolObject.fundingRate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message bybit:>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'gate': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbols: 'btc_usdt'
        });


        const symbolsObjects = symbolsResponse.data;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.name,
                });
                // console.log('symbolFundingRate :>> ', symbolObject.funding_rate);




                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.name) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.funding_rate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.name.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolObject.funding_rate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message gate:>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'htx': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbols: 'btc_usdt'
        });


        const symbolsObjects = symbolsResponse.data.data;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.contract_code,
                });
                // console.log('symbolFundingRate :>> ', symbolObject.funding_rate);




                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.contract_code) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.funding_rate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.contract_code.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolObject.funding_rate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message htx :>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'kraken': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbols: 'btc_usdt'
        });


        const symbolsObjects = symbolsResponse.data.tickers;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            if (symbolObject.pair && symbolObject.tag === "perpetual") {
                try {
                    const formattedPair = symbolObject.pair + 'T';
                    const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                        symbol: symbolObject.pair,
                    });


                    let isUpdated = false;
                    for (let currentDataExchangeIndex in currentData[exchange.title]) {
                        if (currentData[exchange.title][currentDataExchangeIndex].coin === formattedPair) {
                            currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.fundingRate * 100).toFixed(5);
                            isUpdated = true;
                        }
                        if (isUpdated) break;
                    }

                    if (!isUpdated) {
                        currentData[exchange.title].push({
                            coin: formattedPair.split('').map((letter) => {
                                const alphabet = [
                                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                                ];

                                for (const alphabetLetter of alphabet) {
                                    if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                                }

                                return '';
                            }).join(''),
                            funding: +(symbolObject.fundingRate * 100).toFixed(5)
                        });
                    }
                } catch (error) {
                    console.log('error.message kraken :>> ', error.message);
                }
            }
        }

        currentData[exchange.title] = symbols;
    },
    'mexc': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            symbols: 'btc_usdt'
        });


        const symbolsObjects = symbolsResponse.data.data;


        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.symbol,
                });


                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.symbol) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.fundingRate * 100).toFixed(5);
                        currentData[exchange.title][currentDataExchangeIndex].time = symbolFundingRateResponse.data.time;
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.symbol.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolObject.fundingRate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message mexc :>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    },
    'bitget': async (exchange) => {
        const symbolsResponse = await makeGetRequest(exchange.coins, {
            productType: 'USDT-FUTURES'
        });


        const symbolsObjects = symbolsResponse.data.data;

        const symbols = [];

        for (const symbolObject of symbolsObjects) {
            try {
                const symbolFundingRateResponse = await makeGetRequest(exchange.funding, {
                    symbol: symbolObject.symbol,
                });





                let isUpdated = false;
                for (let currentDataExchangeIndex in currentData[exchange.title]) {
                    if (currentData[exchange.title][currentDataExchangeIndex].coin === symbolObject.symbol) {
                        currentData[exchange.title][currentDataExchangeIndex].funding = +(symbolObject.fundingRate * 100).toFixed(5);
                        isUpdated = true;
                    }
                    if (isUpdated) break;
                }

                if (!isUpdated) {
                    currentData[exchange.title].push({
                        coin: symbolObject.symbol.split('').map((letter) => {
                            const alphabet = [
                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                            ];

                            for (const alphabetLetter of alphabet) {
                                if (letter.toLowerCase() == alphabetLetter) return letter.toLowerCase();
                            }

                            return '';
                        }).join(''),
                        funding: +(symbolObject.fundingRate * 100).toFixed(5)
                    });
                }
            } catch (error) {
                console.log('error.message bitget :>> ', error.message);
            }
        }

        // console.log('symbols :>> ', symbols);
        currentData[exchange.title] = symbols;
    }
};

const getCurrentData = () => {
    return currentData;
}



export {
    startParsing,
    getCurrentData
}