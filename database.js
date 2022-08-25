const { Client } = require("pg");
const fs = require("fs");
//const dbFile = "./data/chat_db.db";
//const exists = fs.existsSync(dbFile);
/*const db = new sqlite3.Database(dbFile, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
  **/
const db = new Client({
  ssl: {
    rejectUnauthorized: false,
    // Bör aldrig sättas till rejectUnauthorized i en riktig applikation
    // https://stackoverflow.com/questions/63863591/is-it-ok-to-be-setting-rejectunauthorized-to-false-in-production-postgresql-conn
  },
  connectionString:
    "postgres://fwmqdpixjfhxde:bf594a55557ad3580ga85cb8af44b2e8809a21903268697e61eb602d448da84c@ec2-14-253-119-24.eu-west-1.compute.amazonaws.com:5432/dnqk6u2hrj8d71",
});
db.connect();
/////MESSAGES/////////////////////////////////////////
const messStmt = `CREATE TABLE IF NOT EXISTS messages 
  (
    id SERIAL PRIMARY KEY,
    message VARCHAR (255),
    user VARCHAR (255),
    room VARCHAR (255),
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `;
//if (!exists) {

/////USERS/////////////////////////////////////////
const usersStmt = `CREATE TABLE IF NOT EXISTS users (
    count SERIAL PRIMARY KEY,
    id VARCHAR (255),
    name VARCHAR (255),
    room VARCHAR (255)
  )
  `;

/////ROOMS/////////////////////////////////////////
const roomStmt = `CREATE TABLE IF NOT EXISTS room (
    id SERIAL PRIMARY KEY,
    name VARCHAR (255),
    password CHAR (60) DEFAULT NULL
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

async function createX(name) {
  const insertRoom = `INSERT INTO room (name) VALUES ($1)`;
  const result = await db.query(insertRoom, [name]);

  // result.rows är en array
  // vill du bara få ut ett resultat
  // behöver du ta ut första indexet i arrayen (result.rows[0])
  return result.rows;
}
/*
db.query(roomStmt, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    db.query(insertRoom, (error) => {
      if (error) {
        console.error(error.message);
        throw error;
      }
    });
  }
});
*/

createX("General");
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
