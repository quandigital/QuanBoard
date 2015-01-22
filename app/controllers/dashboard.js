var controller = '/dashboard';

module.exports = function (app) {

    app.route(controller).get(function(req, res, next) {
        var config = app.service.config;
        var mongodb = app.service.mongodb;
        var glob = app.service.glob;

        var files = glob.sync(config.root + '/app/controllers/widget/*.js');
        var userWidgets = {};
        var widgetConfig = require(config.root + '/config/widgets.js');
        var widgets = [{
            widget: 'widgets',
            component: '',
            text : widgetConfig['widgets']['widget-text'] ? widgetConfig['widgets']['widget-text'] : widget,
            position: -1
        }];
        var MongoUser = mongodb.model('User');
        var user = MongoUser.findOne({id: req.session.userId}, function(err, user) {
            if (user) {
                userWidgets = JSON.parse(user.widgets);
            }

            files.forEach(function(file) {
                widget = file.substr(file.lastIndexOf('/') + 1).slice(0, -3);
                widgetComponents = Object.keys(require(config.root + '/config/widget/' + widget + '.json'));
                for (var i = 0; i < widgetComponents.length; i++) {
                    if (widget in userWidgets && widgetComponents[i] in userWidgets[widget]) {
                        var position = userWidgets[widget][widgetComponents[i]];
                        widgets.push({
                            widget: widget,
                            component: widgetComponents[i],
                            text: widgetConfig[widget]['widget-text'] ? widgetConfig[widget]['widget-text'] : widget,
                            position: position
                        });
                    }
                }
            });
            widgets.sort(function(a,b) { return a.position > b.position});

            res.render('dashboard', {
                widgets: widgets
            });
        });
    });
};