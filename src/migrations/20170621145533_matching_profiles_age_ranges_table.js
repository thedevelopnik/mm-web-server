
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles_age_ranges', table => {
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.integer('age_range_id').notNullable().references('id').inTable('age_ranges');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles_age_ranges');
};
