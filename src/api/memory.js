"use strict";

const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

function getMemories(userId, data = {}, cb) {
  let db = new sqlite3.Database("data/db.sqlite");

  data = Object.values(data);
  data.push(userId);

  // insert one row into the tbl_memories table
  db.all(`SELECT * FROM tbl_memories WHERE user_id=(?) ORDER BY entry_date`, ["dca5f097-d3bd-4677-8b62-15212d104a49"], function(err, rows) {
    if (err) {
      // send the error message back to the requester
      cb(err.message);
      return;
    }
    const resData = [];

    rows.forEach((row) => {
      resData.push(row);
    });

    // send the complete queried memories back to the requester
    cb(null, resData);
  });

  // close the database connection
  db.close();
}

function insertMemory(userId, data, cb) {
  let db = new sqlite3.Database("data/db.sqlite");
  const uuid = crypto.randomUUID();

  data = Object.values(data);
  data.push(userId);
  data.unshift(uuid);

  // Encode the <> to prevent html and script injections
  data = data.map((entry) => entry.replace(/</g, "&lt;").replace(/>/g, "&gt;"));

  // insert one row into the tbl_memories table
  db.run(`INSERT OR REPLACE INTO tbl_memories VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, data, function(err) {
    if (err) {
      // send the error message back to the requester
      cb(err.message);
      return;
    }
    // send the last inserted id back to the requester
    cb(null, uuid);
  });

  // close the database connection
  db.close();
}

function deleteMemory(userId, data, cb) {
  let db = new sqlite3.Database("data/db.sqlite");

  data = Object.values(data);
  data.push(userId);

  // insert one row into the tbl_memories table
  db.run(`DELETE FROM tbl_memories WHERE uuid=(?) AND user_id=(?)`, data, function(err) {
    if (err) {
      // send the error message back to the requester
      cb(err.message);
      return;
    }
    // send the deleted id back to the requester
    cb(null, data[0]);
  });

  // close the database connection
  db.close();
}

module.exports = {
  getMemories,
  insertMemory,
  deleteMemory
}
