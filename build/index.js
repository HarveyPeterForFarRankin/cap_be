"use strict";
var express = require('express');
var connectDb = require('./db');
var app = express();
var PORT = 5000;
app.use(express.json());
app.listen(PORT, function () { return console.log("Server Connected to port ".concat(PORT)); });
process.on('unhandledRejection', function (err) { return console.log('err occurred', err); });
