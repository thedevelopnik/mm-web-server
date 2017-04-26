
exports.up = function(knex, Promise) {
  return knex.schema.createTable('schools', function createSchoolsTable(table) {
    table.integer('id').notNullable().primary();
    table.foreign('id').references('id').inTable('auth');
    table.string('display_name').notNullable();
    table.string('name');
    table.boolean('active').default(true);
    table.string('avatar_url');
    table.string('description');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('schools');
};
