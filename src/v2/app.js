const express = require('express');
var path = require('path');
var logger = require("morgan");
var session = require('express-session');
var FileStore = require("session-file-store")(session);

require('dotenv').config()

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var chatRouter = require("./routes/chat");

var fileStoreOptions = {
    path: "./src/v2/sessions"
}

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.SCRET,
    resave: false,
    saveUninitialized: false,
}))

app.use("/",  indexRouter);
app.use("/auth", authRouter);
// app.use("/chat", chatRouter);

module.exports = app;