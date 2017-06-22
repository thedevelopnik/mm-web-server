
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles_organization_types', table => {
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.integer('organization_type_id').notNullable().references('id').inTable('organization_types');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles_organization_types');
};
