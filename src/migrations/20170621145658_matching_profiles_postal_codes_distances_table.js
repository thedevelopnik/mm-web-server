
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles_postal_codes_distances', table => {
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.uuid('postal_code_id').notNullable().references('id').inTable('postal_codes');
      table.integer('distance_id').notNullable().references('id').inTable('distances');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles_postal_codes_distances');
};
