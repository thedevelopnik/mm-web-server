
exports.up = function(knex, Promise) {
  return knex.schema.createTable('auth', function createEducatorsTable(table) {
    table.increments().primary();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('type').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('auth');
};
