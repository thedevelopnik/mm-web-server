import {} from 'mocha';
import * as chai from 'chai';
// import * as bcrypt from 'bcrypt';
// import * as sinon from 'sinon';
// import * as sinonChai = require('sinon-chai');
import * as jwt from 'jsonwebtoken';

chai.should();
// chai.use(sinonChai);

// import { knex } from '../../queries/db';
// import { AuthQuerier } from '../../queries/auth';
import { AuthRouter } from '../../v1-routes/auth';

describe('AuthRouter', function() {
    const router = new AuthRouter();

    describe('makeToken', function() {
        it('makes a token with the correct metadata', function() {
            const token = router.makeToken('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c', 1);
            const decoded = (<{id: string, memberType: number}> jwt.decode(token));
            decoded.id.should.equal('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c');
            decoded.memberType.should.equal(1);
        });
    });

    describe('newUser', function() {
        xit('returns a 400 if there are missing parameters', function() {
            return;
        });

        xit('returns a 400 if email is too long', function() {
            return;
        });

        xit('returns a 400 if password is too long', function() {
            return;
        });

        xit('returns a 201 if it creates a new user', function() {
            return;
        });

        xit('returns a 500 if there is a db error', function() {
            return;
        });
    });

    describe('login', function() {
        xit('returns a 400 if there are missing parameters', function() {
            return;
        });

        xit('returns a 400 if email is too long', function() {
            return;
        });

        xit('returns a 400 if password is too long', function() {
            return;
        });

        xit('returns a 200 if login is successful', function() {
            return;
        });

        xit('returns a 401 if the email is not found', function() {
            return;
        });

        xit('returns a 401 if the password is invalid', function() {
            return;
        });
    });

    describe('changePassword', function() {
        xit('returns a 401 if the old password is invalid', function() {
            return;
        });

        xit('returns a 204 if the password is changed', function() {
            return;
        });

        xit('returns a 500 if there is a db error', function() {
            return;
        });
    });
});