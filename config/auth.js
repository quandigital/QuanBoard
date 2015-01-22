var bcrypt = require('bcrypt');

module.exports = function(mysqlConnection, username, password, callback) {
    var passwordHash = bcrypt.hashSync(password, 'yourSalt');

    var authQuery = 'SELECT id,password FROM users WHERE active = 1 AND username = ? LIMIT 1';

    mysqlConnection.query(authQuery, [username], function (err, rows) {
        if (err) {
            callback(err);
        } else if (rows[0] && rows[0].password === passwordHash) {
            callback(null, rows[0].id);
        } else {
            callback(null, false);
        }
    });
};