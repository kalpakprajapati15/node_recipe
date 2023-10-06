const Mongodb = require('mongodb');

const password = require('./password');

const MongoCLient = Mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoCLient.connect("mongodb+srv://kalpakprajapati:" + `${encodeURIComponent(password.password)}` + "@cluster0.pzrjjcl.mongodb.net/shop?retryWrites=true&w=majority").then(client => {
        _db = client.db();
        console.log('Connected');
        callback(client);
    }).catch(err => console.log(err));
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'Not db connected';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
