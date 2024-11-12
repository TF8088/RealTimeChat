const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "users.json");

function saveUser(user) {
  fs.writeFileSync(dbPath, JSON.stringify(user));
}

module.exports = {
  saveUser,
};
