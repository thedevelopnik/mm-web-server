import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import cookieSession = require('cookie-session');
import AuthRouter from './v1-routes/auth';

const whitelist = ['http://localhost:3000', 'http://localhost:3001'];

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.express.use(logger('dev'));
        this.express.use(cors({
            origin (origin, callback) {
                if (whitelist.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false}));
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(express.static(path.join(__dirname, '../../dist')));
        this.express.use(cookieSession({
            name : 'app.sid',
            secret: '1234567890QWERTY',
            maxAge: 24 * 60 * 60 * 1000,
        }));
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
