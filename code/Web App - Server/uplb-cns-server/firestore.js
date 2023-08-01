module.exports.connect_db = () => {
    const fs = require('firebase-admin');

    const serviceAccount = require('./firestore.json');

    fs.initializeApp({
    credential: fs.credential.cert(serviceAccount)
    });
    module.exports.admin= fs
    module.exports.db = fs.firestore(); 
    module.exports.messaging = fs.messaging();
}