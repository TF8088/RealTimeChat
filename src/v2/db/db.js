const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const dbPath = path.resolve(__dirname, "realtimechat.db");

let db;

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err.message);
      } else {
        console.log("Connected to the SQLite database.");
        resolve();
      }
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err.message);
        } else {
          console.log("SQLite database closed.");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

async function initializeDatabase() {
  try {
    await connectToDatabase();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);
    console.log("Table 'users' initialized or already exists.");
  } catch (err) {
    console.error("Error initializing database:", err.message);
  } finally {
    await closeDatabase();
  }
}

async function createUser(User) {
  try {
    await connectToDatabase();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(User.password, saltRounds);

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [User.username, hashedPassword],
        function (err) {
          if (err) {
            reject(err.message);
          } else {
            resolve(true);
          }
        }
      );
    });
  } catch (err) {
    throw err;
  } finally {
    await closeDatabase();
  }
}

async function findUser(User) {
  try {
    await connectToDatabase();

    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [User.username],
        async (err, storedUser) => {
          if (err) {
            reject(err.message);
          } else if (storedUser) {
            const isMatch = await bcrypt.compare(
              User.password,
              storedUser.password
            );
            if (isMatch) {
              resolve(storedUser);
            } else {
              reject(new Error("Incorrect Username/Password"));
            }
          } else {
            reject(new Error("User not Found"));
          }
        }
      );
    });
  } catch (err) {
    throw err;
  } finally {
    await closeDatabase();
  }
}

initializeDatabase();

module.exports = {
  createUser,
  findUser,
};
