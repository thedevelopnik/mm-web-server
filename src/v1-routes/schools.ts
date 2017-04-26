import * as knex from '../../db/knex.js';
import { School, StringKey, SchoolRegistrant } from './../interfaces';
import * as bcrypt from 'bcrypt';
import { merge } from 'ramda';
import { convertObjectKeysToCamel, convertObjectKeysToSnake, splitAccountCreationObject } from './helpers';

export function getSchoolById(id: number): PromiseLike<School[]> {
  return knex('schools').select().where('id', id)
  .then(function returnEducators(schools: StringKey[]) {
    const schoolArray = schools.map(el => {
      return convertObjectKeysToCamel(el);
    });
    return schoolArray as School[];
  });
};

export function insertSchool(school: SchoolRegistrant): PromiseLike<number> {
  const [login, profile] = splitAccountCreationObject(school);
  return bcrypt.hash(school.password, 10).then(password => {
    const loginInsert = convertObjectKeysToSnake(merge(login, { type: 'school', password }));
    return knex('auth').returning('id').insert(loginInsert) as PromiseLike<number[]>;
  })
  .then((ids: number[]) => {
    const filteredWords: { [key: string]: boolean } = { of: true, the: true, a: true };
    const snakeProfile = convertObjectKeysToSnake(merge(profile, {
      display_name: school.name.split(' ').filter(s => !filteredWords[s]).map(s => s[0]).join(''),
      id: ids[0],
    }));
    return knex('schools').insert(snakeProfile).then(() => ids[0]) as PromiseLike<number>;
  });
}