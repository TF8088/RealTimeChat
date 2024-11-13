var express = require("express");
var { createUser } = require("../db/db");

var router = express.Router();

router.get("/", function (req, res) {
  res.render("auth", { user: req.ip });
});

router.post("/register", function (req, res) {
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
    createUser(newUser);
    res.status(201).send("User registered successfully!"); // Add redirect to chat
  } catch (err) {
    console.error("Err: ", err);
    res.status(500).render("errorPage", {
      err: err,
    });
  }
});

module.exports = router;
