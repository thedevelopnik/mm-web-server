import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

import AuthRouter from './v1-routes/auth';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.express.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false}));
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(express.static(path.join(__dirname, '../../dist')));
    }

    private routes(): void {
        const router = express.Router();
        router.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../build/index.html'));
        });
        this.express.use('/', router);
        this.express.use('/api/v1/auth', AuthRouter);
    }
}

export default new App().express;
