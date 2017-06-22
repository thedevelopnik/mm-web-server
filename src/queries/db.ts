import * as client from 'knex';

export const knex: client = client({
    client: 'pg',
    connection:  {
        host: 'localhost',
        user: 'dsudia',
        password: '',
        database: 'mm'
    },
    pool: {
        min: 2,
        max: 10
    },
    debug: true,
});