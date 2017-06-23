import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as jwt from 'express-jwt';
import { authRouter } from './v1-routes/auth';
import { InvalidToken } from './v1-routes/errors';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.express.use(logger('dev'));
        this.express.use(cors())
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false}));
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use('/', express.static(path.join(__dirname, 'client')));
        this.express.use(jwt({
            secret: process.env.JWT_SECRET || 'shhhh',
            maxAge: '1 day'
        }).unless({
            ext: ['.html', '.js', '.ico', '.png'],
            path: [
                '/',
                { url: '/auth', methods: ['GET', 'POST'] }
            ]
        }));
    }

    private routes(): void {
        const router = express.Router();
        this.express.use('/api/v1', router);
        this.express.use('/api/v1/auth', authRouter);
        this.express.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
            if (err.name === 'UnauthorizedError') {
                res.status(401).json(InvalidToken);
                next();
            } else {
                res.status(500).json({
                    code: 5000,
                    message: 'Unknown server error, please contact support @ hello@montessorimatch.com'
                })
            }
        });
    }
}

export default new App().express;
