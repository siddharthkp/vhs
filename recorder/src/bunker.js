const appConfig = require('../config.json');
const firebase = require('firebase');
firebase.initializeApp(appConfig);
const dbLocation = appConfig.databaseURL;
const newTapeRef = firebase.database().ref('tapes');

const storeEvents = (name, events) => {
    newTapeRef.push({
        'name': name || 'Anonymous', //TODO: Change the name to name of the test
        'events': events
    }).then(function (res) {
        // Call back after pushing events
    });
}

const fetchTapes = () => {
    return fetch(`${dbLocation}/tapes.json`); 
}

module.exports = {
    storeEvents,
    fetchTapes
}
