var config = require('./config/config');
var express = require('express');
var glob = require('glob');
var mysql = require('mysql');
var mongoose = require('mongoose');
var request = require('request');
var superstack = require('superstack');

var app = express();
app.service = {};

app.service.config = config;
app.service.express = express;
app.service.glob = glob;
app.service.request = request;

var mysqlConnection = mysql.createConnection(config.mysql);
app.service.mysql = mysqlConnection;

var mongoConnection = mongoose.connect(
  'mongodb://'
  + config.mongodb.host
  + ':' + config.mongodb.port
  + '/' + config.mongodb.database
);
app.service.mongodb = mongoConnection;

require('./config/express')(app);

glob(config.root + '/app/models/**/*.js', function (err, files) {
  files.forEach(function(file) {
    require(file)(app);
  });
});

require('./config/routes')(app);

glob(config.root + '/app/controllers/**/*.js', function (err, files) {
  files.forEach(function(file) {
    require(file)(app);
  });
});

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});
