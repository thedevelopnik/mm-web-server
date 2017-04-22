
exports.up = function(knex, Promise) {
  return knex.schema.createTable('schools', function createSchoolsTable(table) {
    table.increments();
    table.string('display_name').notNullable();
    table.string('name');
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.boolean('active').default(true);
    table.string('avatar_url');
    table.string('description');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('schools');
};
