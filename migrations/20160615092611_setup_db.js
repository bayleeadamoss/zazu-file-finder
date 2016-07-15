exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('files', (table) => {
    table.string('path')
    table.boolean('isDirectory')
    table.boolean('isRecent')
    table.boolean('isImportant')
    table.timestamp('lastModified')
    table.timestamp('lastProcessed')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('files')
}
