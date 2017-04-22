
exports.up = function(knex, Promise) {
  return knex.schema.createTable('matches', function createSMPTable(table) {
    table.increments();
    table.integer('school_matching_profile_id').references('id').inTable('school_matching_profiles').notNullable();
    table.integer('educator_id').references('id').inTable('educators').notNullable();
    table.integer('percentage').notNullable();
    table.boolean('educator_confirmation').default(false);
    table.boolean('school_confirmation').default(false);
    table.boolean('educator_denial').default(false);
    table.boolean('school_denial').default(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('matches');
};
