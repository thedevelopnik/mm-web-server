
exports.up = function(knex, Promise) {
  return knex.schema.createTable('school_matching_profiles', function createSMPTable(table) {
    table.increments();
    table.integer('school_id').references('id').inTable('schools').notNullable();
    table.boolean('active').default(true);
    table.specificType('age_ranges', 'integer[]');
    table.integer('age_ranges_wgt')
    table.specificType('cals', 'integer[]');
    table.integer('cals_wgt');
    table.specificType('org_types', 'integer[]');
    table.integer('org_types_wgt')
    table.specificType('loc_types', 'integer[]');
    table.integer('loc_types_wgt')
    table.specificType('ed_types', 'integer[]');
    table.integer('ed_types_wgt')
    table.specificType('sizes', 'integer[]');
    table.integer('sizes_wgt')
    table.specificType('trainings', 'integer[]');
    table.integer('trainings_wgt')
    table.specificType('traits', 'integer[]');
    table.integer('traits_wgt')
    table.specificType('states', 'integer[]');
    table.integer('states_wgt')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('school_matching_profiles');
};
