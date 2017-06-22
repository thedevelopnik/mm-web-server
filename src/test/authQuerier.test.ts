import {} from 'mocha';
import * as chai from 'chai';
import { knex } from '../queries/db';
import * as bcrypt from 'bcrypt';
import { Registrant } from '../interfaces';

chai.should();

// import { knex } from '../src/queries/db';
import { AuthQuerier } from '../queries/auth';

describe('AuthQuerier', function() {
    const q = new AuthQuerier();

    beforeEach(function() {
        return knex.migrate.rollback({
            directory: './src/migrations'
        })
        .then(() => {
            return knex.migrate.latest({
                directory: './src/migrations'
            })
            .then(() => {
                return knex.seed.run({
                    directory: './src/seeds'
                });
            });
        });
    });

    afterEach(function() {
        return knex.migrate.rollback({
            directory: './src/migrations'
        });
    });

    describe('insertNewUser', function() {
        it('inserts a new user into the database and return a uuid', function() {
            const newUser = {
                email: 'test@test.com',
                password: 'TestPassword!1',
                memberType: 1
            };
            return q.insertNewUser(newUser)
            .then((id: string) => {
                id.should.be.a('string');
                id.length.should.equal(36);
            });
        });
    });

    describe('findMemberByEmail', function() {
        it('gets a members auth profile by email', function() {
            const email = 'dsudia@gmail.com';
            return q.findMemberByEmail(email)
            .then((member: Registrant) => {
                const id = (<string> member.id);
                id.should.be.equal('b6dc01b4-f1dd-4533-89c5-ca10ed84e72c');
                member.email.should.equal('dsudia@gmail.com');
                member.password.should.be.a('string');
                member.memberType.should.equal(1);
            });
        });
    });

    describe('findMemberPasswordById', function() {
        it('gets a members password using their id', function() {
            const id = 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c';
            return q.findMemberPasswordById(id)
            .then((password: string) => {
                const valid = bcrypt.compareSync('TestPassword!1', password);
                password.should.be.a('string');
                valid.should.equal(true);
            });
        });
    });

    describe('updatePassword', function() {
        it('updates a password correctly', function() {
            const id = 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c';
            const hash = bcrypt.hashSync('ANewPassword!1', 10);
            return q.updatePassword(id, hash)
            .then(() => {
                return q.findMemberPasswordById(id)
                .then((password: string) => {
                    const valid = bcrypt.compareSync('ANewPassword!1', password);
                    valid.should.equal(true);
                });
            });
        });
    });
});
