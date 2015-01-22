var controller = '/user';

function login(req, res, config, app) {
    var auth = require(config.root + '/config/auth');

    auth(app.service.mysql, req.body.user.username, req.body.user.password, function(err, userId) {
        if (err) {
            console.log("Auth Error:\n" + err);
            res.send(err);
        } else if (userId === false) {
            res.render('user/login', {wrongLogin: true});
        } else {
            req.session.userId = userId;
            res.redirect(config.home);
        }
    });
};

module.exports = function (app) {
    app.route(controller + '/login')
        .get(function(req,res) {
            var config = app.service.config;

            if (req.session.userId) {
                res.redirect(config.home);
            } else {
                res.render('user/login');
            }
        })

        .post(function(req, res) {
            var config = app.service.config;

            if (req.session.userId) {
                res.redirect(config.home);
            } else {
                login(req, res, config, app);
            }
        });

    app.route(controller + '/logout').get(function(req,res) {
        if (req.session.userId) {
            req.session.destroy(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect(app.service.config.login);
                }
            });
        } else {
            res.redirect(app.service.config.login);
        }
    });
};