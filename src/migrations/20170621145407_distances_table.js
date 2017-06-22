
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('distances', table => {
      table.increments('id').primary();
      table.integer('distance').unique().notNullable();
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('distances');
};
