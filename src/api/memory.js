"use strict";

const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

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

module.exports = {
  insertMemory
}
