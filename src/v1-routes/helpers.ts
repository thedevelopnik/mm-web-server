import { StringKey } from './../interfaces';
import { camel, snake } from 'change-case';

export function convertObjectKeysToCamel(obj: StringKey): StringKey {
  for (let key in obj) {
    if (typeof key === 'string') {
      key = camel(key);
    }
  }
  return obj;
}

export function convertObjectKeysToSnake(obj: StringKey): StringKey {
  return Reflect.ownKeys(obj).reduce((snakeObject: StringKey, key: string) => {
    snakeObject[snake(key)] = obj[key];
    return snakeObject;
  },                                 {});
}
