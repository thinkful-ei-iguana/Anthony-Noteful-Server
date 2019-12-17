const express = require("express");
const notefulRouter = express.Router();
const logger = require("./logger");
const bodyParser = express.json();
const notefulService = require("./notefulService");
const xss = require("xss");
const path = require("path");

// Folder Routes

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
});

notefulRouter
  .route("/api/folders/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    notefulService
      .getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newFolder = { name };

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });

    notefulService
      .insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

notefulRouter
  .route("/api/folder/:folderId")
  .all((req, res, next) => {
    notefulService
      .getFolderById(req.app.get("db"), req.params.id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { name, note } = req.body;
    const folderToUpdate = { name, note };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: "Request body must content either 'folder name' or 'note'"
        }
      });

    notefulService
      .updateFolder(req.app.get("db"), req.params.id, folderToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

// Note Routes

const serializenNote = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folderid: note.folderid,
  content: xss(note.content)
});

notefulRouter
  .route("/api/notes")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    notefulService
      .getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializenNote));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name, content, modified, folderid } = req.body;
    const newNote = { name, content, modified, folderid };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    notefulService
      .insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializenNote(note));
      })
      .catch(next);
  });

notefulRouter
  .route("/api/notes/:id")
  .all((req, res, next) => {
    notefulService
      .getNoteById(req.app.get("db"), req.params.id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: "Note does not exist" }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializenNote(res.note));
  })
  .delete((req, res, next) => {
    notefulService
      .deleteNote(req.app.get("db"), req.params.id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { noteName, content, modified } = req.body;
    const noteToUpdate = { noteName, content, modified };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message:
            "Request body must contain either 'note name', 'content', or 'date_modified'"
        }
      });

    notefulService
      .updateNote(req.app.get("db"), req.params.id, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });
module.exports = notefulRouter;
