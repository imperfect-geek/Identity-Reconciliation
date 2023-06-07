CreateContactsTable = (knex) => {
    return knex.schema.createTable('Contacts', table => {
        table.increments('id').primary();
        table.string('phoneNumber', 255);
        table.string('email', 255);
        table.integer('linkedId').unsigned().nullable();
        table.enum('linkPrecedence', ['secondary', 'primary']).defaultTo('secondary');
        table.dateTime('createdAt').defaultTo(knex.fn.now());
        table.dateTime('updatedAt').defaultTo(knex.fn.now());
        table.dateTime('deletedAt').nullable();
    });
}

module.exports = CreateContactsTable

