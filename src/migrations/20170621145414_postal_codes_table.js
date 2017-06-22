
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('postal_codes', table => {
    table.uuid('id').primary().unique().notNullable();
    table.string('code', 20).unique().notNullable();
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('postal_codes');
};
