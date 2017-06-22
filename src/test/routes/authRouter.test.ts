import {} from 'mocha';
import * as chai from 'chai';
// import * as bcrypt from 'bcrypt';
import * as sinon from 'sinon';
// import * as sinonChai = require('sinon-chai');
import * as jwt from 'jsonwebtoken';
import * as httpMocks from 'node-mocks-http';
import * as Promise from 'bluebird';
import { MockResponse } from 'node-mocks-http';

chai.should();
// chai.use(sinonChai);

// import { knex } from '../../queries/db';
import { AuthQuerier } from '../../queries/auth';
import { AuthRouter } from '../../v1-routes/auth';
import { InvalidParameters, InsertMemberFailure, MissingParameters } from '../../v1-routes/errors';

describe('AuthRouter', function() {
    const router = new AuthRouter();
    const querier = new AuthQuerier();

    describe('makeToken', function() {
        it('makes a token with the correct metadata', function() {
            const token = router.makeToken('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c', 1);
            const decoded = (<{id: string, memberType: number}> jwt.decode(token));
            decoded.id.should.equal('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c');
            decoded.memberType.should.equal(1);
        });
    });

    describe('newUser', function() {
        it('returns a 400 if there are missing parameters', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'TestPassword!1'
                }
            });
            const mres = httpMocks.createResponse();
            router.newUser(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(MissingParameters);
            done();
        });

        it('returns a 400 if email not valid', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@',
                    password: 'TestPassword!1',
                    memberType: '1'
                }
            });
            const mres = httpMocks.createResponse();
            router.newUser(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(InvalidParameters);
            done();
        });

        it('returns a 400 if password is not valid', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'aaaaaaaa',
                    memberType: '1'
                }
            });
            const mres = httpMocks.createResponse();
            router.newUser(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(InvalidParameters);
            done();
        });

        it('returns a 201 if it creates a new user', function() {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'TestPassword!1',
                    memberType: '1'
                }
            });
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'insertNewUser');
            stub.onFirstCall().returns(Promise.resolve('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c'));

            return (<Promise<MockResponse>> router.newUser(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const token = mres._getData().authToken;
                const decoded = (<{id: string, memberType: number}> jwt.decode(token));
                code.should.equal(201);
                decoded.id.should.equal('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c');
                stub.restore();
            });
        });

        it('returns a 500 if there is a db error', function() {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'TestPassword!1',
                    memberType: '1'
                }
            });
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'insertNewUser');
            stub.onFirstCall().returns(Promise.reject(new Error('database error')));

            return (<Promise<MockResponse>> router.newUser(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const error = JSON.parse(mres._getData());
                code.should.equal(500);
                error.should.eql(InsertMemberFailure);
                stub.restore();
            });
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