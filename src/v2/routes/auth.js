var express = require('express');
var crypto = require('crypto');
var db = require('../db/db');

var router = express.Router();

router.get("/", function(req, res) {
    res.render("auth", { user: req.ip })
});

router.post("/register", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    console.log(req.body)

    if (!username || !password) {
        return res.status(400).render("errorPage", { err: 'Username and password are required' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
        username,
        password: hashedPassword,
    }

    db.saveUser(newUser);
    
    res.send("User registered successfully!")
})

module.exports = router;