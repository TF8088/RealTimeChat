const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");

require("dotenv").config();

var uri =
  "mongodb+srv://" +
  process.env.MONGO_USER +
  ":" +
  process.env.MONGO_PASS +
  "@realtimechat.vn4bg.mongodb.net/";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function createUser(User) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(User.pasword, saltRounds);
    User.pasword = hashedPassword;

    await client.connect();

    const database = client.db("realtimechat");

    const user_collection = database.collection("users");

    await user_collection.insertOne(User);
    return true;
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }
}

module.exports = {
  createUser,
};
