import { camel, snake } from 'change-case';

export function convertObjectKeysToCamel(obj: any): any {
  for (let key in obj) {
    if (typeof key === 'string') {
      key = camel(key);
    }
  }
  return obj;
}

export function convertObjectKeysToSnake(obj: any): any {
  for (let key in obj) {
    if (typeof key === 'string') {
      key = snake(key);
    }
  }
  return obj;
}
