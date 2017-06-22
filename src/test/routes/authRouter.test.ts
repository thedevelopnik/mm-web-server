import {} from 'mocha';
import * as chai from 'chai';
import * as bcrypt from 'bcrypt';
import * as sinon from 'sinon';
// import * as sinonChai = require('sinon-chai');
import * as jwt from 'jsonwebtoken';
import * as httpMocks from 'node-mocks-http';
import * as Promise from 'bluebird';
import { MockRequest, MockResponse } from 'node-mocks-http';

chai.should();
// chai.use(sinonChai);

interface SecureMockRequest extends MockRequest {
    user: {
        id: string;
        memberType: string;
    };
}

import { AuthQuerier } from '../../queries/auth';
import { AuthRouter } from '../../v1-routes/auth';
import {
    BadLogin,
    InvalidParameters,
    InsertMemberFailure,
    MissingParameters,
    UpdatePasswordFailure
} from '../../v1-routes/errors';

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
        it('returns a 400 if there are missing parameters', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'GET',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                }
            });
            const mres = httpMocks.createResponse();
            router.login(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(MissingParameters);
            done();
        });

        it('returns a 400 if email is invalid', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'aaaaaaaa',
                }
            });
            const mres = httpMocks.createResponse();
            router.login(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(InvalidParameters);
            done();
        });

        it('returns a 400 if password is invalid', function(done: Function) {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'aaaaaaaa',
                }
            });
            const mres = httpMocks.createResponse();
            router.login(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(InvalidParameters);
            done();
        });

        it('returns a 200 if login is successful', function() {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'TestPassword!1',
                    memberType: '1'
                }
            });
            const hash = bcrypt.hashSync('TestPassword!1', 10);
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'findMemberByEmail');
            stub.onFirstCall().returns(Promise.resolve({
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                email: 'dsudia@test.com',
                password: hash,
                memberType: 1
            }));

            return (<Promise<MockResponse>> router.login(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const token = mres._getData().authToken;
                const decoded = (<{id: string, memberType: number}> jwt.decode(token));
                code.should.equal(200);
                decoded.id.should.equal('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c');
                stub.restore();
            });
        });

        it('returns a 401 if the email is not found', function() {
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
            const stub = sinon.stub(querier, 'findMemberByEmail');
            stub.onFirstCall().returns(Promise.reject(new Error('could not find email')));

            return (<Promise<MockResponse>> router.login(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const data = JSON.parse(mres._getData());
                code.should.equal(401);
                data.should.eql(BadLogin);
                stub.restore();
            });
        });

        it('returns a 401 if the password is invalid', function() {
            const mreq = httpMocks.createRequest({
                method: 'POST',
                url: '/auth',
                body: {
                    email: 'dsudia@test.com',
                    password: 'AGreatPassword!1',
                    memberType: '1'
                }
            });
            const hash = bcrypt.hashSync('TestPassword!1', 10);
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'findMemberByEmail');
            stub.onFirstCall().returns(Promise.resolve({
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                email: 'dsudia@test.com',
                password: hash,
                memberType: 1
            }));

            return (<Promise<MockResponse>> router.login(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const data = JSON.parse(mres._getData());
                code.should.equal(401);
                data.should.eql(BadLogin);
                stub.restore();
            });
        });
    });

    describe('changePassword', function() {
        it('returns a 400 if a parameter is missing', function(done: Function) {
            const mreq = (<SecureMockRequest> httpMocks.createRequest({
                method: 'PUT',
                url: '/auth',
                body: {
                    oldPassword: 'TestPassword!1'
                }
            }));
            mreq.user = {
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                memberType: '1'
            };
            const mres = httpMocks.createResponse();

            router.changePassword(mreq, mres);
            const code = mres._getStatusCode();
            const data = JSON.parse(mres._getData());
            code.should.equal(400);
            data.should.eql(MissingParameters);
            done();
        });

        it('returns a 401 if the old password is invalid', function() {
            const mreq = (<SecureMockRequest> httpMocks.createRequest({
                method: 'PUT',
                url: '/auth',
                body: {
                    oldPassword: '1TestPassword!',
                    newPassword: 'AGreatPassword!1'
                }
            }));
            mreq.user = {
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                memberType: '1'
            };
            const hash = bcrypt.hashSync('TestPassword!1', 10);
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'findMemberPasswordById');
            stub.onFirstCall().returns(Promise.resolve(hash));
            return (<Promise<MockResponse>> router.changePassword(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const data = JSON.parse(mres._getData());
                code.should.equal(401);
                data.should.eql(BadLogin);
                stub.restore();
            });
        });

        it('returns a 204 if the password is changed', function() {
            const mreq = (<SecureMockRequest> httpMocks.createRequest({
                method: 'PUT',
                url: '/auth',
                body: {
                    oldPassword: 'TestPassword!1',
                    newPassword: 'AGreatPassword!1'
                }
            }));
            mreq.user = {
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                memberType: '1'
            };
            const hash = bcrypt.hashSync('TestPassword!1', 10);
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'findMemberPasswordById');
            const stub2 = sinon.stub(querier, 'updatePassword');
            stub.onFirstCall().returns(Promise.resolve(hash));
            stub2.onFirstCall().returns(Promise.resolve());
            return (<Promise<MockResponse>> router.changePassword(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                code.should.equal(204);
                stub.restore();
                stub2.restore();
            });
        });

        it('returns a 500 if there is a db error', function() {
            const mreq = (<SecureMockRequest> httpMocks.createRequest({
                method: 'PUT',
                url: '/auth',
                body: {
                    oldPassword: '1TestPassword!',
                    newPassword: 'AGreatPassword!1'
                }
            }));
            mreq.user = {
                id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c',
                memberType: '1'
            };
            const mres = httpMocks.createResponse();
            const next = () => { return; };
            const stub = sinon.stub(querier, 'findMemberPasswordById');
            stub.onFirstCall().returns(Promise.reject(new Error('error updating password')));
            return (<Promise<MockResponse>> router.changePassword(mreq, mres, next, querier))
            .then(() => {
                const code = mres._getStatusCode();
                const data = JSON.parse(mres._getData());
                code.should.equal(500);
                data.should.eql(UpdatePasswordFailure);
                stub.restore();
            });
        });
    });
});