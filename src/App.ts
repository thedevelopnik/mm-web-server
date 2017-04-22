import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
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
        router.get('/', function defaultHandler(req, res, next) {
            res.sendFile(path.join(__dirname, '../build/index.html'));
        });
        this.express.use('/', router);
    }
}

export default new App().express;
