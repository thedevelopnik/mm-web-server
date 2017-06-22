
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
    return knex('member_types').del()
    .then(function () {
        // Inserts seed entries
        return knex('member_types').insert([
            {id: 1, type: 'educator'},
            {id: 2, type: 'schools'}
        ]);
    });
};
