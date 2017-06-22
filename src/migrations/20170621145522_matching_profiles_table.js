
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('matching_profiles', table => {
      table.uuid('id').primary().unique().notNullable();
      table.uuid('member_id').references('id').inTable('members');
      table.boolean('active').notNullable().defaultTo(true);
      table.integer('age_ranges_weight');
      table.integer('calendars_weight');
      table.integer('location_types_weight');
      table.integer('organization_types_weight');
      table.integer('education_types_weight');
      table.integer('sizes_weight');
      table.integer('training_types_weight');
      table.integer('traits_weight');
      table.integer('distance_weight');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('matching_profiles');
};
