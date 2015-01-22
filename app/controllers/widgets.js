var widgetConfig = {
    controller: 'widgets'
}

function controller(req, res, app, callback) {
    var config = app.service.config;
    var mongodb = app.service.mongodb;
    var glob = app.service.glob;

    glob(config.root + '/app/controllers/widget/*.js', function (er, files) {
        var widgets = {};
        var widgetConfig = require(config.root + '/config/widgets.js');
        var widget;
        var MongoUser = mongodb.model('User');
        var user = MongoUser.findOne({id: req.session.userId}, function(err, user) {
            var userWidgets = {};
            if (user) {
                userWidgets = JSON.parse(user.widgets);
            }

            files.forEach(function (file) {
                widget = file.substr(file.lastIndexOf('/') + 1).slice(0, -3);
                if (widget != 'widgets') {
                    if (!widgets[widget]) {
                        widgets[widget] = [];
                    }
                    widgetComponents = Object.keys(require(config.root + '/config/widget/' + widget + '.json'));
                    for (var i=0; i<widgetComponents.length; i++) {
                        widgets[widget].push({
                            name: widgetComponents[i],
                            checked: widget in userWidgets && widgetComponents[i] in userWidgets[widget],
                            text: widgetConfig[widget]['widget-text'] ? widgetConfig[widget]['widget-text'] : widget
                        });
                    }
                }
            });

            callback(req, res, app, {
                widgets: widgets
            });
        });
    });
}

function render(req, res, app, controllerData) {
    res.render(widgetConfig.controller, controllerData);
}

module.exports = function (app) {

    app.route('/' + widgetConfig.controller)
        .get(function (req, res) {
            var config = app.service.config;
            var mysql = app.service.mysql;
            var mongodb = app.service.mongodb;
            var glob = app.service.glob;

            controller(req, res, app, render);
        })

        .post(function (req, res) {
            var mongodb = app.service.mongodb;

            var widgets = {};
            if (req.body.widgets) {
                widgets = req.body.widgets;
            }
            var MongoUser = mongodb.model('User');
            var user = MongoUser.findOne({id: req.session.userId}, function(err, user) {
                if (!user) {
                    user = new MongoUser({
                        id: req.session.userId
                    });
                }
                user.widgets = JSON.stringify(widgets);
                user.markModified('widgets');
                user.save();
                controller(req, res, app, render);
            });
        });
}