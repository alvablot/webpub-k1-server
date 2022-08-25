const { Client } = require("pg");
const timeStamp = require("./utils/timeStamp");
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer();
const db = require("./database.js");
const fs = require("fs");
const port = "";
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io"],
    allowedHeaders: ["GET", "POST"],
    credentials: true,
  },
});
let count2;
let users = [];
const fetchUsers = "SELECT * FROM users";
const insertUser = "INSERT INTO users";
const insertRoom = "INSERT INTO room";
const fetchRooms = "SELECT * FROM room";
const fetchTheUser = "SELECT name FROM users WHERE name";
const insertMessage = "INSERT INTO messages";
const fetchMessage = "SELECT * FROM messages ORDER BY time_stamp, room DESC";
const deleteRow = "DELETE FROM users";
const deleteRoomRow = "DELETE FROM room";
const deleteMessRow = "DELETE FROM messages";
function initTable(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      resolve(rows);
    });
  });
}

async function addMessage(message, room, name) {
  const query = `
  ${insertMessage} (message, room, user) 
  VALUES($1, $2, $3)`;
  db.query(query, [message, room, name]);
  const fetchMessage = `SELECT * FROM messages WHERE room = '${room}' ORDER BY time_stamp, room DESC`;
  const result = await initTable(fetchMessage);
  return result;
}

async function getMessages(room) {
  const fetchMessage = `SELECT * FROM messages WHERE room = '${room}'`;
  const result = await initTable(fetchMessage);
  return result;
}

async function getUsers() {
  const query = fetchUsers;
  const result = await initTable(query);
  return result;
}

async function deleteUser(id) {
  db.query(`${deleteRow} WHERE id = $1`, id, (err) => {});
  const result = await initTable(fetchUsers);
  if (result.length < 1) return 404;
  return result;
}

async function deleteRoom(roomName) {
  db.query(`${deleteRoomRow} WHERE name = $1`, roomName, (err) => {});
  const result = await initTable(fetchRooms);
  if (result.length < 1) return 404;
  return result;
}

async function deleteMessages(roomName) {
  db.query(`${deleteMessRow} WHERE room = $1`, roomName, (err) => {});
  const result = await initTable(fetchRooms);
  if (result.length < 1) return 404;
  return result;
}

async function getTheUsers(name) {
  const query = `fetchTheUser = ${name}`;
  const result = await initTable(query);
  return result;
}

async function addUser(userId, userName) {
  const query = `
  ${insertUser} (id, name) 
  VALUES($1, $2)`;
  db.query(query, [userId, userName]);
  const result = await initTable(fetchUsers);
  return result;
}

async function addRoom(userId, roomName, password) {
  const query = `
  ${insertRoom} (name, password) 
  VALUES($1, $2)`;
  db.query(query, [roomName, password]);
  const result = await initTable(fetchRooms);
  return result;
}

async function getRooms() {
  const query = fetchRooms;
  const result = await initTable(query);
  return result;
}

io.on("connection", (socket) => {
  socket.use(([event, ...args], next) => {
    if (event === "sendToServer") {
      const message = args[0];
      const room = args[1];
      const user = args[2];
      const logRow = `USER: '${args[2]}', MESSAGE: '${args[0]}', ROOM: '${
        args[1]
      }' DATE: '${timeStamp()}'\n`;
      fs.writeFile("./log.txt", logRow, { flag: "a+" }, (err) => {
        if (err) throw err;
      });
    }
    next();
  });

  socket.on("disconnect", function () {
    let DbUsers = deleteUser(socket.id);
    DbUsers.then(function (result) {
      const users = result;
      socket.emit("sendUserToClient", users);
      socket.broadcast.emit("sendUserToClient", users);
    });
  });

  socket.on("logIn", (name) => {
    let existingUser = getTheUsers(name);
    existingUser.then(function (result) {
      const user = result;
    });
  });
  let clientUser;
  ///////////////////////////////////////////////////////////////////
  socket.on("sendToServer", (message, room, name, userId) => {
    clientUser = name;
    if (message === "") return;
    let dbMessages = addMessage(message, room, name);
    dbMessages.then(function (result) {});
    message = `${name}: ${message}`;
    socket.to(room).emit("sendToClient", message);
  });

  socket.on("getMessages", (room) => {
    let dbMessages = getMessages(room);
    dbMessages.then(function (result) {});
  });

  socket.on("typingToServer", (user, room) => {
    socket.to(room).emit("typingToClient", user);
  });

  socket.on("sendUsersToServer", (userId, userName) => {
    let DbUsers = addUser(userId, userName);
    DbUsers.then(function (result) {
      const users = result;
      socket.emit("sendUserToClient", users);
      socket.broadcast.emit("sendUserToClient", users);
    });
  });

  socket.on("getUsers", () => {
    let DbUsers = getUsers();
    DbUsers.then(function (result) {
      const users = result;
      socket.emit("sendUserToClient", users);
      socket.broadcast.emit("sendUserToClient", users);
    });
  });

  socket.on("sendRoomToServer", (userId, roomName, password) => {
    if (password === undefined) password = null;
    let dbRooms = addRoom(userId, roomName, password);
    dbRooms.then(function (result) {
      const users = result;
      socket.emit("sendRoomsToClient", users);
      socket.broadcast.emit("sendRoomsToClient", users);
    });
  });

  socket.on("getRooms", () => {
    let dbRooms = getRooms();
    dbRooms.then(function (result) {
      const rooms = result;
      socket.emit("sendRoomsToClient", rooms);
      socket.broadcast.emit("sendRoomsToClient", rooms);
    });
  });

  socket.on("joinRoom", (room, name, callback) => {
    const currentRooms = Array.from(socket.rooms);
    socket.leave(currentRooms[1]);
    socket.join(room);
    let dbMessages = getMessages(room);
    dbMessages.then(function (result) {
      const messages = result;
      socket.emit("sendMessagesToClient", messages);
    });
  });

  socket.on("deleteRoomFromDb", function (userId, roomName) {
    let dbRooms = deleteRoom(roomName);
    dbRooms.then(function (result) {
      socket.emit("sendRoomsToClient", result);
      socket.broadcast.emit("sendRoomsToClient", result);
    });

    let dbMessages = deleteMessages(roomName);
    dbMessages.then(function (result) {
      const removed = {
        user: "Server",
        room: roomName,
        message: `${roomName} and all its messages has been deleted`,
      };
      socket.broadcast.emit("deletedRoomsToClient", removed);
      socket.emit("sendRoomsToClient", result);
      socket.broadcast.emit("sendRoomsToClient", result);
    });
  });

  socket.on("remove", function (userId) {
    let DbUsers = deleteUser(userId);
    DbUsers.then(function (result) {
      const users = result;
      socket.emit("sendUserToClient", users);
      socket.broadcast.emit("sendUserToClient", users);
    });
  });
});

io.listen(port);
