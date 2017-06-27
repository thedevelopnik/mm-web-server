import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
// import { omit, pick, merge } from 'ramda';
import { Registrant, SecureRequest } from './../interfaces';
import { AuthQuerier } from '../queries/auth';
import {
    BadLogin,
    InsertMemberFailure,
    InvalidParameters,
    MissingParameters,
    UpdatePasswordFailure
} from './errors';
import { lowercaseEmail } from './helpers';
import getLogger from '../log';
import * as jwt from 'jsonwebtoken';
import * as validator from 'validator';

const passValidator = require('password-validator');

const schema = new passValidator();
schema.is().min(8)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols()
    .has().not().spaces();

const logger = getLogger('auth');

export class AuthRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    newUser(req: Request, res: Response, next?: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        const user: Registrant = req.body;
        user.memberType = (<number> user.memberType);
        if (!user.email || !user.password || !user.memberType) {
            return res.status(400).json(MissingParameters);
        }
        if (!validator.isEmail(user.email)) {
            return res.status(400).json(InvalidParameters);
        }
        if (!schema.validate(user.password)) {
            return res.status(400).json(InvalidParameters);
        }
        return q.insertNewUser(user)
        .then((id: string) => {
            const authToken = this.makeToken(id, user.memberType);
            res.status(201).send({authToken});
            return;
        })
        .catch((err: string) => {
            logger.error(err);
            return res.status(500).json(InsertMemberFailure);
        });
    }

    login(req: Request, res: Response, next?: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        if (!req.query.email || !req.query.password) {
            res.status(400).json(MissingParameters);
            return;
        }
        if (!validator.isEmail(req.query.email)) {
            return res.status(400).json(InvalidParameters);
        }
        if (!schema.validate(req.query.password)) {
            return res.status(400).json(InvalidParameters);
        }
        const loginDetails = lowercaseEmail(req.query);
        return q.findMemberByEmail(loginDetails.email)
        .then((member: Registrant) => {
            const valid = bcrypt.compareSync(loginDetails.password, member.password);
            if (!valid) {
                return res.status(401).json(BadLogin);
            }
            const authToken = this.makeToken((<string> member.id), member.memberType);
            return res.status(200).send({authToken});
        })
        .catch((err: string) => {
            logger.error(err);
            return res.status(401).json(BadLogin);
        });
    }

    changePassword(req: SecureRequest, res: Response, next?: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        if (!req.body.oldPassword || !req.body.newPassword) {
            return res.status(400).json(MissingParameters);
        }
        return q.findMemberPasswordById(req.user.id)
        .then((password: string) => {
            const valid = bcrypt.compareSync(req.body.oldPassword, password);
            if (!valid) {
                return res.status(401).json(BadLogin);
            }
            return q.updatePassword(req.user.id, req.body.newPassword)
            .then(() => {
                return res.status(204);
            });
        })
        .catch((err: string) => {
            logger.error(err);
            return res.status(500).json(UpdatePasswordFailure);
        });
    }

    makeToken(id: string, memberType: number): string {
        const payload = Object.assign({}, {
            id: id,
            memberType: memberType
        });
        const authToken = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'shhhh',
            { expiresIn: '1 day' }
        );
        return authToken;
    }

    init() {
        this.router.post('/', this.newUser.bind(this));
        this.router.get('/', this.login.bind(this));
        this.router.put('/', this.changePassword.bind(this));
    }

    // private loginSchool(loginProfile: LoginProfile, req: Request, res: Response, next: NextFunction) {
    //     return Promise.all([
    //     knex(`schools`).where('id', loginProfile.id),
    //     knex('matches')
    //         .whereIn( 'school_matching_profile_id',
    //                 knex('school_matching_profiles').select('id')
    //                     .where('school_id', loginProfile.id)
    //                     .whereNot('educator_denial', true)
    //                     .whereNot('school_denial', true))
    //         .innerJoin('educators', 'matches.educator_id', 'educators.id')
    //         .select([
    //         'matches.id as id',
    //         'matches.percentage as percentage',
    //         'matches.school_confirmation as my_confirmation',
    //         'matches.educator_confirmation as their_confirmation',
    //         'educators.display_name as display_name',
    //         'educators.avatar_url as avatar_url',
    //         'educators.description as description',
    //         ]),
    //     knex('school_matching_profiles').where('school_id', loginProfile.id),
    //     ])
    //     .then(([profile, matches, matchingProfiles]: [ School[], Match[], SchoolMatchingProfile[]]) => {
    //     req.session.id = loginProfile.id;
    //     res.status(200).send({
    //         profile: convertObjectKeysToCamel(omit(['id'],  profile[0])),
    //         matches: matches.map(convertObjectKeysToCamel),
    //         matchingProfiles: matchingProfiles.map(convertObjectKeysToCamel),
    //     });
    //     })
    //     .catch(error => {
    //     logger.error(error);
    //     res.status(500).send('an error occured, please contact support');
    //     });
    // }

    // private loginEducator(loginProfile: LoginProfile, req: Request, res: Response, next: NextFunction) {
    //     return Promise.all([
    //     knex('educators').where('id', loginProfile.id),
    //     knex('matches')
    //         .where('educator_id', loginProfile.id)
    //         .whereNot('educator_denial', true)
    //         .whereNot('school_denial', true)
    //         .innerJoin( 'school_matching_profiles',
    //                     'matches.school_matching_profile_id', 'school_matching_profiles.id')
    //         .innerJoin('schools', 'school_matching_profiles.school_id', 'schools.id')
    //         .select([
    //         'matches.id as id',
    //         'matches.percentage as percentage',
    //         'matches.educator_confirmation as my_confirmation',
    //         'matches.school_confirmation as their_confirmation',
    //         'schools.display_name as display_name',
    //         'schools.avatar_url as avatar_url',
    //         'schools.description as description',
    //         ]),
    //     ])
    //     .then(([profile, matches]: [ Educator, Match[] ]) => {
    //     const matchingKeys = [
    //         'age_ranges', 'age_ranges_wgt',
    //         'cals', 'cals_wgt',
    //         'org_types', 'org_types_wgt',
    //         'loc_types', 'loc_types_wgt',
    //         'ed_types', 'ed_types_wgt',
    //         'sizes', 'sizes_wgt',
    //         'trainings', 'trainings_wgt',
    //         'traits', 'traits_wgt',
    //         'states', 'states_wgt',
    //     ];
    //     const sanitizedProfile = merge(omit([...matchingKeys, 'id'], profile), { email: req.body.email });
    //     const sanitizedMatchingProfile = pick(matchingKeys, profile);
    //     req.session.id = profile.id;
    //     res.status(200).send({
    //         profile: convertObjectKeysToCamel(sanitizedProfile),
    //         matches: matches.map(convertObjectKeysToCamel),
    //         matchingProfiles: [convertObjectKeysToCamel(sanitizedMatchingProfile)],
    //     });
    //     })
    //     .catch(error => {
    //     logger.error(error);
    //     res.status(500).send('an error occured, please contact support');
    //     });
    // }
}

export const authRouter = new AuthRouter().router;
