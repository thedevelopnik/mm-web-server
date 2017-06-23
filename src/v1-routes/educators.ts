// import * as knex from '../db/knex.js';
// import { EducatorRegistrant, Educator, StringKey } from '../interfaces';
// import * as Promise from 'bluebird';
// import * as bcrypt from 'bcrypt';
// import { merge } from 'ramda';
// import { convertObjectKeysToCamel, convertObjectKeysToSnake, splitAccountCreationObject } from './helpers';

// export function getEducatorById(id: number): Promise<Educator[]> {
//   return knex('educators').select().where('id', id)
//   .then(function returnEducators(eds: StringKey[]) {
//     const educatorArray = eds.map(el  => {
//       return convertObjectKeysToCamel(el);
//     });
//     return educatorArray as Educator[];
//   });
// }

// export function insertEducator(educator: EducatorRegistrant): PromiseLike<number> {
//   const [login, profile] = splitAccountCreationObject(educator);
//   return bcrypt.hash(educator.password, 10).then(password => {
//     const loginInsert = convertObjectKeysToSnake(merge(login, { type: 'educator', password }));
//     return knex('auth').returning('id').insert(loginInsert) as PromiseLike<number[]>;
//   })
//   .then((ids: number[]) => {
//     const snakeProfile = convertObjectKeysToSnake(merge(profile, {
//       display_name: `${educator.firstName}${educator.lastName[0]}`,
//       id: ids[0],
//     }));
//     return knex('educators').insert(snakeProfile).then(() => ids[0]) as PromiseLike<number>;
//   });
// }
