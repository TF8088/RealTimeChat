var app = require("../app");
var debug = require('debug')('todos:server');
var http = require("http");

require("dotenv").config();

var port = process.env.PORT || 3000;

app.set(port);

var server = http.createServer(app);

server.listen(port);
