
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('members', table => {
      table.uuid('id').primary().unique().notNullable();
      table.string('email', 50).unique().notNullable();
      table.string('password').notNullable();
      table.boolean('active').defaultTo(true).notNullable();
      table.integer('member_type_id').references('id').inTable('member_types');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('members');
};
