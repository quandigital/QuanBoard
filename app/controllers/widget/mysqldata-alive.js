var mysql = require('mysql');

var widgetName = __filename.slice(__filename.lastIndexOf('/')+1, -3);

module.exports = function (app) {
    app.route('/widget/' + widgetName + '/:param').get(function (req, res, next) {
        var config = app.service.config;
        var widgetComponent = req.params.param;
        var widgetConfig = require(config.root + '/config/widget/' + widgetName + '.json')[widgetComponent];

        var mysqlConnection = mysql.createConnection(widgetConfig.connection);

        mysqlConnection.query(widgetConfig.query, function (err, rows) {
            if (err) {
                console.log('/widget/' + widgetName + ":\n" + err);
                res.status(500).end();
            } else {
                (rows && rows[0] && rows[0][Object.keys(rows[0])]) ? res.status(200).end() : res.status(400).end();
            }
            mysqlConnection.end();
        });
    });
};