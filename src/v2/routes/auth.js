var express = require("express");
var { createUser } = require("../db/db");

var router = express.Router();

router.get("/", function (req, res) {
  res.render("auth", { user: req.ip });
});

router.post("/register", async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .render("errorPage", { err: "Username and password are required" });
  }

  const newUser = {
    username,
    password: password,
  };

  try {
    await createUser(newUser);
    res.status(201).send("User registered successfully!");
  } catch (err) {
    console.error("Err: ", err);
    res.status(500).render("errorPage", {
      err: "Registration failed. Please try again.",
    });
  }
});

module.exports = router;
