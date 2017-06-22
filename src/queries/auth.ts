import { knex } from './db';
import * as Promise from 'bluebird';
import * as uuid from 'uuid/v4';
import * as bcrypt from 'bcrypt';
import { Registrant } from '../interfaces';

export class AuthQuerier {

    insertNewUser(newUser: Registrant): Promise<string> {
        const id = uuid();
        const hash = bcrypt.hashSync(newUser.password, 10);
        return knex.returning('id')
        .insert({
            id,
            email: newUser.email,
            password: hash,
            member_type_id: newUser.memberType
        })
        .into('members')
        .then((ids: string[]) => {
            return ids[0];
        });
    }

    findMemberByEmail(email: string): Promise<Registrant | string> {
        return knex('members')
        .where({
            email,
        })
        .select('id', 'password', 'member_type_id as memberType')
        .then((members: Registrant[]) => {
            const member = members[0];
            return {
                id: member.id,
                email,
                password: member.password,
                memberType: member.memberType
            };
        });
    }

    findMemberPasswordById(id: string): Promise<string> {
        return knex('members')
        .where({
            id,
        })
        .select('password')
        .then((passwords: {password: string}[]) => {
            return passwords[0].password;
        });
    }

    updatePassword(id: string, password: string) {
        return knex('members')
        .where({
            id,
        })
        .update({
            password,
        });
    }
}
