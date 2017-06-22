
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('member_types', table => {
      table.increments('id').primary();
      table.string('type', 50).notNullable().unique();
      table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('member_types');
};
