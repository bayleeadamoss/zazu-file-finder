exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('files', (table) => {
    table.string('type')
    table.string('path').unique()
    table.boolean('isRecent')
    table.boolean('isImportant')
    table.timestamp('lastModified')
    table.timestamp('lastProcessed')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('files')
}
