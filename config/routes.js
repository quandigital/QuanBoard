module.exports = function (app) {
    app.use(function (req, res, next) {
        var config = app.service.config;

        if (req.path != config.login && req.path != config.logout && !req.session.userId && req.connection.remoteAddress !== '127.0.0.1') {
            res.redirect(config.login);
        } else {
            next();
        }
    });

    app.route('/').get(function(req, res) {
        var config = app.service.config;
        res.redirect(config.home);
    });
}