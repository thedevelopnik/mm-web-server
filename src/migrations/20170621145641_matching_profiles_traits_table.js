
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles_traits', table => {
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.integer('trait_id').notNullable().references('id').inTable('traits');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles_traits');
};
