import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { omit, pick, merge } from 'ramda';
import * as knex from '../../db/knex.js';
import { EducatorRegistrant, SchoolRegistrant, Match, School, Educator, SchoolMatchingProfile } from './../interfaces';
import { insertSchool } from './schools';
import { insertEducator } from './educators';
import { lowercaseEmail, convertObjectKeysToCamel } from './helpers';
import getLogger from '../log';

const logger = getLogger('auth');

function isEducatorRegistrant(registrant: EducatorRegistrant | SchoolRegistrant): registrant is EducatorRegistrant {
  return (<EducatorRegistrant> registrant).firstName !== undefined;
}

interface LoginProfile {
  id: number;
  email: string;
  password: string;
  type: string;
}

export class AuthRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  newUser(req: Request, res: Response, next: NextFunction) {
    if (isEducatorRegistrant(req.body)) {
      insertEducator(req.body).then(id => {
        req.session.id = id;
        res.status(201).send('id');
      });
    } else {
      insertSchool(req.body).then(id => {
        req.session.id = id;
        res.status(201).send('ok');
      });
    }
  }

  login(req: Request, res: Response, next: NextFunction) {
    const loginDetails = lowercaseEmail(req.body);
    knex('auth').where('email', loginDetails.email).first()
    .then((loginProfile: LoginProfile) => {
      return bcrypt.compare(loginDetails.password, loginProfile.password)
      .then((match) => {
        if (match) {
          if (loginProfile.type === 'school') {
            this.loginSchool(loginProfile, req, res, next);
          } else {
            this.loginEducator(loginProfile, req, res, next);
          }
        } else {
          res.status(401).send('bad email or password');
        }
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).send('an error occured, please contact support');
    });
  }

  logout(req: Request, res: Response, next: NextFunction) {
    req.session = <any> null;
    res.status(200).send('ok');
  }

  ping(req: Request, res: Response, next: NextFunction) {
    res.status(200).send(`ID ${req.session.id}`);
  }


  init() {
    this.router.post('/new-user', this.newUser.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/logout', this.logout.bind(this));
    this.router.get('/ping', this.ping.bind(this));
  }

  private loginSchool(loginProfile: LoginProfile, req: Request, res: Response, next: NextFunction) {
    return Promise.all([
      knex(`schools`).where('id', loginProfile.id),
      knex('matches')
        .whereIn( 'school_matching_profile_id',
                  knex('school_matching_profiles').select('id')
                    .where('school_id', loginProfile.id)
                    .whereNot('educator_denial', true)
                    .whereNot('school_denial', true))
        .innerJoin('educators', 'matches.educator_id', 'educators.id')
        .select([
          'matches.id',
          'matches.percentage',
          'matches.educator_confirmation',
          'matches.school_confirmation',
          'educators.display_name',
          'educators.avatar_url',
          'educators.description',
        ]),
      knex('school_matching_profiles').where('school_id', loginProfile.id),
    ])
    .then(([profile, matches, matchingProfiles]: [ School[], Match[], SchoolMatchingProfile[]]) => {
      req.session.id = loginProfile.id;
      res.status(200).send({
        profile: convertObjectKeysToCamel(omit(['id'],  profile[0])),
        matches: matches.map(convertObjectKeysToCamel),
        matchingProfile: matchingProfiles.map(convertObjectKeysToCamel),
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).send('an error occured, please contact support');
    });
  }

  private loginEducator(loginProfile: LoginProfile, req: Request, res: Response, next: NextFunction) {
    return Promise.all([
      knex('educators').where('id', loginProfile.id),
      knex('matches')
        .where('educator_id', loginProfile.id)
        .whereNot('educator_denial', true)
        .whereNot('school_denial', true)
        .innerJoin( 'school_matching_profiles',
                    'matches.school_matching_profile_id', 'school_matching_profiles.id')
        .innerJoin('schools', 'school_matching_profiles.school_id', 'schools.id')
        .select([
          'matches.id',
          'matches.percentage',
          'matches.educator_confirmation',
          'matches.school_confirmation',
          'schools.display_name',
          'schools.avatar_url',
          'schools.description',
        ]),
    ])
    .then(([profile, matches]: [ Educator, Match[] ]) => {
      const matchingKeys = [
        'age_ranges', 'age_ranges_wgt',
        'cals', 'cals_wgt',
        'org_types', 'org_types_wgt',
        'loc_types', 'loc_types_wgt',
        'ed_types', 'ed_types_wgt',
        'sizes', 'sizes_wgt',
        'trainings', 'trainings_wgt',
        'traits', 'traits_wgt',
        'states', 'states_wgt',
      ];
      const sanitizedProfile = merge(omit([...matchingKeys, 'id'], profile), { email: req.body.email });
      const sanitizedMatchingProfile = pick(matchingKeys, profile);
      req.session.id = profile.id;
      res.status(200).send({
        profile: convertObjectKeysToCamel(sanitizedProfile),
        matches: matches.map(convertObjectKeysToCamel),
        matchingProfile: [convertObjectKeysToCamel(sanitizedMatchingProfile)],
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).send('an error occured, please contact support');
    });
  }
}

const authRouter = new AuthRouter();

export default authRouter.router;