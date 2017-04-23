import * as knex from '../../db/knex.js';
import { EducatorRegistrant, Educator, StringKey } from '../interfaces';
import * as Promise from 'bluebird';
import { convertObjectKeysToCamel, convertObjectKeysToSnake } from './helpers';

export function getEducatorById(id: number): Promise<Educator[]> {
  return knex('educators').select().where('id', id)
  .then(function returnEducators(eds: StringKey[]) {
    const educatorArray = eds.map(el  => {
      return convertObjectKeysToCamel(el);
    });
    return educatorArray as Educator[];
  });
};

export function insertEducator(educator: EducatorRegistrant): Promise<number> {
  const snakeEducator = convertObjectKeysToSnake(educator);
  snakeEducator.display_name = `${educator.firstName}${educator.lastName[0]}`;
  return knex('educators').returning('id').insert(snakeEducator)
  .then(function returnIds(ids: number[]) {
    return ids[0];
  });
}
