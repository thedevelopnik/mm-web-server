import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
// import { omit, pick, merge } from 'ramda';
import { Registrant, TokenContents } from './../interfaces';
import { AuthQuerier } from '../queries/auth';
import {
    BadLogin,
    FindMemberFailure,
    InsertMemberFailure,
    InvalidToken,
    MissingParameters,
    UpdatePasswordFailure
} from './errors';
import { lowercaseEmail } from './helpers';
import getLogger from '../log';
import * as jwt from 'jsonwebtoken';

const logger = getLogger('auth');

// interface LoginProfile {
//   id: number;
//   email: string;
//   password: string;
//   type: string;
// }

export class AuthRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    newUser(req: Request, res: Response, next: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        const user: Registrant = req.body;
        if (!user.email || !user.password || !user.memberType) {
            res.status(400).send(MissingParameters);
            return next();
        }
        return q.insertNewUser(user)
        .then((id: string) => {
            const authToken = this.makeToken(id, user.memberType);
            res.status(201).send({authToken});
            return next();
        })
        .catch((err: string) => {
            logger.error(err);
            res.status(500).send(InsertMemberFailure);
            return next();
        });
    }

    login(req: Request, res: Response, next: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        if (!req.body.email || !req.body.password) {
            res.status(400).send(MissingParameters);
            return next();
        }
        const loginDetails = lowercaseEmail(req.body);
        return q.findMemberByEmail(loginDetails.email)
        .then((member: Registrant) => {
            const valid = bcrypt.compareSync(loginDetails.password, member.password);
            if (!valid) {
                res.status(401).send(BadLogin);
                return next();
            }
            const authToken = this.makeToken((<string> member.id), member.memberType);
            res.status(200).send({authToken});
            return next();
        })
        .catch((err: string) => {
            logger.error(err);
            res.status(500).send(FindMemberFailure);
            return next();
        });
    }

    changePassword(req: Request, res: Response, next: NextFunction, q: AuthQuerier = new AuthQuerier()) {
        const authToken = req.header('authToken');
        let decoded: TokenContents;
        try {
            decoded = (<TokenContents> jwt.verify(
                authToken,
                process.env.JWT_SECRET || 'shhhh',
                {maxAge: '1 day'}
            ));
        } catch (err) {
            logger.error(err);
            res.status(401).send({InvalidToken});
            return next();
        }
        return q.findMemberPasswordById(decoded.id)
        .then((password: string) => {
            const valid = bcrypt.compare(req.body.oldPassword, password);
            if (!valid) {
                res.status(401).send(BadLogin);
                return next();
            }
            return q.updatePassword(decoded.id, req.body.newPassword)
            .then(() => {
                res.status(204);
                return next();
            });
        })
        .catch((err: string) => {
            logger.error(err);
            res.status(500).send(UpdatePasswordFailure);
            return next();
        });
    }

    makeToken(id: string, memberType: number): string {
        const signingObject = Object.create({}, {
            id,
            memberType
        });
        const authToken = jwt.sign(
            signingObject,
            process.env.JWT_SECRET || 'shhhh',
            { expiresIn: '1 day' }
        );
        return authToken;
    }

    init() {
        this.router.post('/auth', this.newUser.bind(this));
        this.router.get('/auth', this.login.bind(this));
        this.router.put('/auth', this.changePassword.bind(this));
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

const authRouter = new AuthRouter();

export default authRouter.router;
