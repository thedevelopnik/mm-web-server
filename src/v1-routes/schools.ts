import * as knex from '../../db/knex.js';
import { School, StringKey, SchoolRegistrant } from './../interfaces';
import * as Promise from 'bluebird';
import { convertObjectKeysToCamel, convertObjectKeysToSnake } from './helpers';

export function getSchoolById(id: number): Promise<School[]> {
  return knex('schools').select().where('id', id)
  .then(function returnEducators(schools: StringKey[]) {
    const schoolArray = schools.map(el => {
      return convertObjectKeysToCamel(el);
    });
    return schoolArray as School[];
  });
};

export function insertSchool(school: SchoolRegistrant): Promise<number> {
  console.log('school?', school);
  const snakeSchool = convertObjectKeysToSnake(school);
  snakeSchool.display_name = school.name.split(' ').map(s => s[0]).join('');
  return knex('schools').returning('id').insert(snakeSchool)
  .then(function returnIds(ids: number[]) {
    return ids[0];
  });
}
