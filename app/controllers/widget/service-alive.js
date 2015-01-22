var sshConnect = require('ssh2-connect');
var sshExec = require('ssh2-exec');

var widgetName = __filename.slice(__filename.lastIndexOf('/')+1, -3);

module.exports = function (app) {
    app.route('/widget/' + widgetName + '/:param').get(function (req, res, next) {
        var config = app.service.config;
        var widgetComponent = req.params.param;
        var widgetConfig = require(config.root + '/config/widget/' + widgetName + '.json')[widgetComponent];

        if (widgetConfig.connection.ssh_key) {
            widgetConfig.connection.privateKeyPath = './config/ssh-keys/' + widgetConfig.connection.ssh_key;
            delete(widgetConfig.connection.ssh_key);
        }

        var connection = widgetConfig.connection;

        connection.readyTimeout = 1000;
        connection.retry = 1;

        sshConnect(connection, function (err, ssh) {
            if (err) {
                console.log('widget/' + widgetName + ":\n" + err);
                res.status(500).end();
            } else {
                sshExec({
                    cmd: widgetConfig.check.command,
                    ssh: ssh
                }, function (err, stdout, stderr) {
                    if (err) {
                        console.log('widget/' + widgetName + "\n" + err);
                        res.status(500).end();
                    } else {
                        var regEx = new RegExp(widgetConfig.check.expectation);
                        (regEx.exec(stdout) != null) ? res.status(200).end() : res.status(400).end();
                    }
                    ssh.end();
                });
            }
        });
    });
};