import { StringKey, SchoolRegistrant, EducatorRegistrant } from './../interfaces';
import { camel, snake } from 'change-case';
import { pick, omit } from 'ramda';

interface LoginDetails {
  email: string;
  password: string;
}

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


export function splitAccountCreationObject(obj: SchoolRegistrant | EducatorRegistrant) {
  const loginInfo = ['email', 'password'];
  return [lowercaseEmail(<LoginDetails> pick(loginInfo, obj)), omit(loginInfo, obj)];
}

export function lowercaseEmail(loginDetails: LoginDetails): LoginDetails {
  return {
    email: loginDetails.email.toLowerCase(),
    password: loginDetails.password,
  };
}