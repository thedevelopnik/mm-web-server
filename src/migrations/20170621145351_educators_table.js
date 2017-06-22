
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('educators', table => {
      table.uuid('id').primary().unique().notNullable().references('id').inTable('members');
      table.string('display_name').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('avatar_url');
      table.text('description');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('educators');
};
