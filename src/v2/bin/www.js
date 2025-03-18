var app = require("../app");
var http = require("http");

require("dotenv").config();

var port = process.env.PORT || 3000;

app.set(port);

var server = http.createServer(app);

server.listen(port);