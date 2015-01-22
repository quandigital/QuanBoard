module.exports = function (app) {
    var mongodb = app.service.mongodb;

    var Schema = mongodb.Schema;

    var User = new Schema({
        id: {
            type: String,
            require: true
        },
        widgets: String
    });

    mongodb.model('User', User);
}