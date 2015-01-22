var curl = require('node-curl');

var widgetName = __filename.slice(__filename.lastIndexOf('/')+1, -3);

module.exports = function (app) {
    app.route('/widget/' + widgetName + '/:param').get(function (req, res, next) {
        var config = app.service.config;
        var widgetComponent = req.params.param;
        var widgetConfig = require(config.root + '/config/widget/' + widgetName + '.json')[widgetComponent];

        var date = new Date();
        date.setDate(date.getDate() - widgetConfig.check.days);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var mailsSince = date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear();

        var curlSession = curl.create();

        var connection = widgetConfig.connection;

        curlSession(connection.url + '/' + encodeURIComponent(widgetConfig.check.folder), {
            CUSTOMREQUEST: 'SEARCH RETURN (COUNT) UNSEEN SINCE ' + mailsSince,
            USERPWD: connection.username + ':' + connection.password
        }, function (err) {
            if (err) {
                console.log('/widget/' + widgetName + ":\n" + err);
                res.status(500).end();
            } else {
                var regEx = new RegExp('ESEARCH \\(TAG "[A-Z][0-9]{3}"\\) COUNT ([0-9]+)?');
                var regExResult = regEx.exec(this.body);
                var count = (regExResult && regExResult[1]) ? regExResult[1] : '-1';

                if (count == -1) {
                    res.status(500).end();
                } else if (count <= widgetConfig.check.limit) {
                    res.status(200).end();
                } else {
                    res.status(400).end();
                }
            }
            this.close();
        });
    });
};
