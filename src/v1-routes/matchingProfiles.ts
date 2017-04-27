import { Router, Request, Response, NextFunction } from 'express';
import * as knex from '../../db/knex.js';
import { convertObjectKeysToSnake } from './helpers';
import getLogger from '../log';

const logger = getLogger('matchingProfiles');

export class AuthRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  postProfile(req: Request, res: Response, next: NextFunction) {
    if (req.body.id) {
        knex('school_matching_profiles').update(convertObjectKeysToSnake(req.body))
        .then(() => {
            res.status(202).send('OK')
        })
        .catch(error => {
            logger.error(error);
            res.status(500).send('an error occured, please contact support');
        });
    } else {
        knex('educators').update(convertObjectKeysToSnake(req.body))
        .then(() => {
            res.status(202).send('OK')
        })
        .catch(error => {
            logger.error(error);
            res.status(500).send('an error occured, please contact support');
        });
    }
  }

  init() {
    this.router.post('/', this.postProfile.bind(this));
  }
}