import * as knex from '../../db/knex.js';
import { ISchool } from '../interfaces';
import * as Promise from 'bluebird';
import { convertObjectKeysToCamel, convertObjectKeysToSnake } from './helpers';

export function getSchoolById(id: number): Promise<ISchool[]> {
  return knex('schools').select().where('id', id)
  .then(function returnEducators(schools) {
    const schoolArray = schools.map(el => {
      return convertObjectKeysToCamel(el);
    });
    return schoolArray as ISchool[];
  });
};

export function insertSchool(school: ISchool): Promise<number> {
  school = convertObjectKeysToSnake(school);
  return knex('schools').returning('id').insert(school)
  .then(function returnIds(ids) {
    return ids[0] as number;
  });
}
