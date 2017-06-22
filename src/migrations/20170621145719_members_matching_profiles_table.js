
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('members_matching_profiles', table => {
      table.uuid('member_id').notNullable().references('id').inTable('members');
      table.uuid('matching_profile_id').notNullable().references('id').inTable('matching_profiles');
      table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('members_matching_profiles');
};
