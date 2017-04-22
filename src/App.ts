import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as pgStore from 'connect-pg-simple';
import * as pg from 'pg';

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
        this.express.use(session({
            store: new pgStore({
                pg: pg,
                conString: process.env.DATABASE_URL,
                tableName: 'user_sessions'
            })(session),
            secret: process.env.SECRET,
            cookie: {}
        }));
    }

    private routes(): void {
        let router = express.Router();
        router.get('/', function defaultHandler(req, res, next) {
            res.json({
                message: 'Hello World!'
            });
        });
        this.express.use('/', router);
    }
}

export default new App().express;
