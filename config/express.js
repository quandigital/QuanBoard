var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var swig = require('swig');

module.exports = function (app) {
    var config = app.service.config;
    var express = app.service.express;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
        secret: config.sessionSecret,
        store: new mongoStore({ mongooseConnection: app.service.mongodb.connection }),
        resave: false,
        saveUninitialized: false
    }));

    app.engine('html', swig.renderFile);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'html');

    app.use(express.static(config.root + '/public'));
    app.use('/bower_components',  express.static(config.root + '/bower_components'));
};