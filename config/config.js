var path = require('path');

module.exports = {
    root: path.normalize(__dirname + '/..'),
    home: '/dashboard',
    login: '/user/login',
    logout: '/user/logout',
    port: 3000,
    sessionSecret: 'yourSessionSecret',
    mongodb: {
        host: '127.0.0.1',
        port: 27017,
        database: 'dashboard'
    },
    mysql: {
        host: '127.0.0.1',
        user: 'dashboard',
        password: 'pass',
        database: 'dashboard'
    }
};