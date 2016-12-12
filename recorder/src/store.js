const config = require('../config.json');

const firebase = require('firebase');
firebase.initializeApp(config);

const dbLocation = config.databaseURL;
const newTapeRef = firebase.database().ref('tapes');

const save = (name, events) => {
    newTapeRef.push({
        'name': name || 'Anonymous', //TODO: Change the name to name of the test
        'events': events
    }).then(function (res) {
        // Call back after pushing events
    });
}

const get = () => {
    return fetch(`${dbLocation}/tapes.json`);
}

module.exports = {
    save,
    get
}
