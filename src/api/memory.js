"use strict";

const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

function getMemories($userId, data = {}, cb) {
  let db = new sqlite3.Database("data/db.sqlite");

  // Prepare the where clause which searches title, description, locations, activities
  // and persons for the entered search string
  // If no search string was entered then let the searchClauses be empty
  let searchClauses = "";
  if (data.hasOwnProperty("$search") && data.$search.trim() !== "") {
    searchClauses = " AND (entry_date LIKE $search OR title LIKE $search OR description LIKE $search OR locations LIKE $search OR activities LIKE $search OR persons LIKE $search)";
    data.$search = `%${data.$search}%`;
  } else {
    delete data.$search;
  }

  // Prepare the where clause which additionally filters the records to
  // 0 -> no favorites
  // 1 -> favorites
  // all other numbers -> both (delete the favorite filter)
  let favoriteClause = "";
  if (data.hasOwnProperty("$favorite") && (data.$favorite === "0" || data.$favorite === "1")) {
    favoriteClause = " AND favorite = $favorite";
  } else {
    delete data.$favorite;
  }

  // Prepare the where ckause which additionally filters the records to the mood
  // 🚫 or an empty string means no mood filter
  let moodClause = "";
  if (data.hasOwnProperty("$mood") && data.$mood.trim() !== "" && data.$mood !== "🚫") {
    moodClause = " AND mood = $mood";
  } else {
    delete data.$mood;
  }

  // Add the $userId to the data object & delete the getMemories property
  // Otherwise the used and defined wildcards don't match -> error
  data.$userId = $userId;
  delete data.getMemories;

  db.serialize(() => {
    // Create the table tbl_memories if no table exists
    db.run(`CREATE TABLE IF NOT EXISTS "tbl_memories" (
      "uuid"	TEXT NOT NULL UNIQUE,
      "entry_date"	TEXT NOT NULL,
      "title"	TEXT NOT NULL,
      "favorite"	INTEGER NOT NULL,
      "mood"	TEXT,
      "description"	TEXT,
      "url"	TEXT,
      "locations"	TEXT,
      "activities"	TEXT,
      "persons"	TEXT,
      "user_id"	TEXT NOT NULL,
      PRIMARY KEY("uuid")
    );`);

    // Get the rows according to the select statement
    db.all(`SELECT * FROM tbl_memories WHERE user_id = $userId${searchClauses}${favoriteClause}${moodClause} ORDER BY entry_date`, data, function (err, rows) {
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
  });

  // close the database connection
  db.close();
}

function insertMemory(userId, data, cb) {
  let db = new sqlite3.Database("data/db.sqlite");
  const uuid = crypto.randomUUID();


  //***********TODO: Convert the base64 code to blob and save it in the database */
  //*********** */
  //***************** */


  // If the uuid is empty, then a new entry in the sqlite db will be done
  if (data.uuid === "") {
    data.uuid = uuid;
  }

  data = Object.values(data);
  data.push(userId);

  // Encode the <> to prevent html and script injections
  data = data.map((entry) => entry.replace(/</g, "&lt;").replace(/>/g, "&gt;"));

  // insert one row into the tbl_memories table
  db.run(`INSERT OR REPLACE INTO tbl_memories VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, data, function (err) {
    if (err) {
      // send the error message back to the requester
      cb(err.message);
      return;
    }
    // send the last inserted id back to the requester
    cb(null, data.uuid);
  });

  // close the database connection
  db.close();
}

function deleteMemory(userId, data, cb) {
  let db = new sqlite3.Database("data/db.sqlite");

  data = Object.values(data);
  data.push(userId);

  // insert one row into the tbl_memories table
  db.run(`DELETE FROM tbl_memories WHERE uuid=(?) AND user_id=(?)`, data, function (err) {
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
