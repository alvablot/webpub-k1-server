const { Client } = require("pg");
const fs = require("fs");
//const dbFile = "./data/chat_db.db";
//const exists = fs.existsSync(dbFile);/*

const db = new Client({
  ssl: {
    rejectUnauthorized: false,
    // Bör aldrig sättas till rejectUnauthorized i en riktig applikation
    // https://stackoverflow.com/questions/63863591/is-it-ok-to-be-setting-rejectunauthorized-to-false-in-production-postgresql-conn
  },
  connectionString:
    "postgres://jhidcakxlhrals:5a7653e8845c2f284b79485a9df4d9e1d3b192f193c08ba845d82aee470061b0@ec2-34-247-72-29.eu-west-1.compute.amazonaws.com:5432/d18o143vlqa2v8",
});

/*
const db = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "rootUser",
  database: "chat_db",
});
*/
db.connect();

/////MESSAGES/////////////////////////////////////////
const messStmt = `CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  message TEXT,
  "user" TEXT,
  room TEXT,
  time_stamp DATE DEFAULT CURRENT_TIMESTAMP
  )
  `;
//DEFAULT CURRENT_TIMESTAMP
//if (!exists) {

/////USERS/////////////////////////////////////////
const usersStmt = `CREATE TABLE IF NOT EXISTS users (
    count SERIAL PRIMARY KEY,
    id TEXT,
    name TEXT,
    room TEXT
  )
  `;

/////ROOMS/////////////////////////////////////////
const roomStmt = `CREATE TABLE IF NOT EXISTS room (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password TEXT DEFAULT NULL
  )
  `;

db.query(messStmt, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
});
db.query(usersStmt, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
});



db.query(roomStmt, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    const insertRoom = `INSERT INTO room (name) VALUES ("General")`;
    db.query(insertRoom, (error) => {
      if (error) {
        console.error(error.message);
        throw error;
      }
    });
  }
});


/*



db.run(roomStmt, (error) => {
  if (error) {
  } else {
    
    return db.query(sql, ["General"], function (error, user) {
      if (error) {
        console.error(error.message);
      } 

      return user;
    });
  }
});
else {
        
      }
/*
db.run(messStmt, (error) => {
  if (error) {
  }
});
db.run(usersStmt, (error) => {
  if (error) {
  }
});

db.run(roomStmt, (error) => {
  if (error) {
  } else {
    const insertRoom = `INSERT INTO room (
        name
        ) VALUES (?)`;
    db.run(insertRoom, ["General"]);
  }
});
//});
*/
module.exports = db;
