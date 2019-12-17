const notefulService = {
  // folder services
  getAllFolders(knex) {
    return knex("folders").select("*");
  },
  getFolderById(knex, id) {
    return knex("folders")
      .select("*")
      .where("id", id)
      .first();
  },
  insertFolder(knex, newNote) {
    return knex("folders")
      .insert(newNote)
      .returning("*")
      .then(rows => rows[0]);
  },
  deleteFolder(knex, id) {
    return knex("folders")
      .where({ id })
      .delete();
  },
  updateFolder(knex, id, updatedData) {
    return knex("folders")
      .where({ id })
      .update(updatedData);
  },
  // notes services
  getAllNotes(knex, dbFolderId) {
    return knex("notes").select("*");
  },
  getNoteById(knex, id) {
    return knex("notes")
      .select("*")
      .where("id", id)
      .first();
  },
  insertNote(knex, newNote) {
    return knex("notes")
      .insert(newNote)
      .returning("*")
      .then(rows => rows[0]);
  },
  deleteNote(knex, id) {
    return knex("notes")
      .where({ id })
      .delete();
  },
  updateNote(knex, id, updatedData) {
    return knex("notes")
      .where({ id })
      .update(updatedData);
  }
};

module.exports = notefulService;
