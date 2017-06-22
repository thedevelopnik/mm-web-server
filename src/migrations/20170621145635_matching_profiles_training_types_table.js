
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles_training_types', table => {
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.integer('training_type_id').notNullable().references('id').inTable('training_types');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles_training_types');
};
