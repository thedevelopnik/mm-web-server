const bcrypt = require('bcrypt');

exports.seed = function(knex, Promise) {
    const hashedPass = bcrypt.hashSync('TestPassword!1', 10);

    // Deletes ALL existing entries
    return knex('members').del()
    .then(function () {
        // Inserts seed entries
        return knex('members').insert([
            {id: 'b6dc01b4-f1dd-4533-89c5-ca10ed84e72c', email: 'dsudia@gmail.com', password: hashedPass, active: true, member_type_id: 1},
            {id: 'ad5fb9ca-b39d-4fe4-a485-5dbf9c14048b', email: 'principal@school.com', password: hashedPass, active: true, member_type_id: 2}
        ]);
    });
};
