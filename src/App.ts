import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as jwt from 'express-jwt';
import { authRouter } from './v1-routes/auth';
import { InvalidToken } from './v1-routes/errors';

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
            origin (origin: string, callback: Function) {
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
        this.express.use(jwt({
            secret: process.env.JWT_SECRET || 'shhhh',
            maxAge: '1 day'
        }).unless({
            path: [
                '/index.html',
                { url: '/auth', methods: ['GET', 'POST'] }
            ]
        }));
    }

    private routes(): void {
        const router = express.Router();
        router.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../build/index.html'));
        });
        this.express.use('/', router);
        this.express.use('/api/v1/auth', authRouter);
        this.express.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
            if (err.name === 'UnauthorizedError') {
                res.status(401).send(InvalidToken);
                next();
            }
        });
    }
}

export default new App().express;
