var ping = require('ping');

var widgetName = __filename.slice(__filename.lastIndexOf('/')+1, -3);

module.exports = function (app) {
    app.route('/widget/' + widgetName + '/:param').get(function (req, res, next) {
        var config = app.service.config;
        var widgetComponent = req.params.param;
        var widgetConfig = require(config.root + '/config/widget/' + widgetName + '.json')[widgetComponent];

        ping.sys.probe(widgetConfig, function (alive) {
            alive ? res.status(200).end() : res.status(400).end();
        });
    });
};