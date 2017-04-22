import * as knex from '../../db/knex.js';
import { IEducator } from '../interfaces';
import * as Promise from 'bluebird';
import { convertObjectKeysToCamel, convertObjectKeysToSnake } from './helpers';

export function getEducatorById(id: number): Promise<IEducator[]> {
  return knex('educators').select().where('id', id)
  .then(function returnEducators(eds) {
    const educatorArray = eds.map(el => {
      return convertObjectKeysToCamel(el);
    });
    return educatorArray as IEducator[];
  });
};

export function insertEducator(educator: IEducator): Promise<number> {
  educator = convertObjectKeysToSnake(educator);
  return knex('educators').returning('id').insert(educator)
  .then(function returnIds(ids) {
    return ids[0] as number;
  });
}
