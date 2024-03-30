import express from 'express';
import hbs from 'hbs';
import expressHbs from 'express-handlebars';
import fs from 'fs';
import { createServer } from 'http';
import { createWSS } from './wss.js';
import { startParsing, getCurrentData } from './parsing.js';
import { utils } from './utils.js';

const exchanges = await utils.getExchanges();
// console.log('exchanges :>> ', exchanges);


startParsing(exchanges);


setInterval(() => {
    startParsing(exchanges);
}, 100000);



const app = express();
const server = createServer(app);
createWSS(server);


app.engine('hbs', expressHbs.engine(
    {
        layoutsDir: './src/web/views/layouts', 
        defaultLayout: 'layout',
        extname: 'hbs'
    }
));
app.set('view engine', 'hbs');
app.set('views', './src/web/views');
hbs.registerPartials('./src/web/views/partials');



app.use(express.static('./src/web/static'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        res.redirect('/all');
    } catch (error) {
        console.log('error.message app.get / :>> ', error.message);
    }
});

app.get('/:exchange', async (req, res) => { // sdlfsldkfkls
    try {
        // console.log('req.params :>> ', req.params);
        const exchangeTitle = req.params.exchange;



        console.log('exchange :>> ', exchangeTitle);

        for(const exchange of exchanges) {
            if(exchange.title.toLowerCase() === exchangeTitle.toLowerCase()) {
                res.render('home', {
                    port: 80,
                    exchanges,
                    data: utils.sortByExchange(utils.transformData(getCurrentData()), exchangeTitle)
                });
            }
        }

        if(exchangeTitle === 'all') {
            res.render('home', {
                port: 80,
                exchanges,
                data: utils.transformData(getCurrentData()), exchangeTitle
            });
        }

    } catch (error) {
        console.log('error.message /home :>> ', error.message);
        res.sendStatus(400);
    }
});


server.listen(80, () => {
    console.log('Express JS Service started!');
});