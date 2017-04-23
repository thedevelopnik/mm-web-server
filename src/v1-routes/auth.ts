import { Router, Request, Response, NextFunction } from 'express';
import { EducatorRegistrant, SchoolRegistrant } from './../interfaces';
import { insertSchool } from './schools';
import { insertEducator } from './educators';

function isSchool(registrant: EducatorRegistrant | SchoolRegistrant): registrant is SchoolRegistrant {
  return (<SchoolRegistrant> registrant).name !== undefined;
} 

export class AuthRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  newUser(req: Request, res: Response, next: NextFunction) {
    if (isSchool(req.body)) {
      insertSchool(req.body).then(id => {
        res.send(201, {
          id
        });
      });
    } else {
      insertEducator(req.body).then(id => {
        res.send(201, {
          id
        });
      });
    }
  }

  init() {
    this.router.post('/new-user', this.newUser);
  }
}

const authRouter = new AuthRouter();

export default authRouter.router;