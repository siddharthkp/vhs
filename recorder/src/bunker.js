const appConfig = require('../config.json');
const firebase = require('firebase');
firebase.initializeApp(appConfig);
const dbLocation = appConfig.databaseURL;
const newTapeRef = firebase.database().ref('tapes');

const storeEvents = (events) => {
    newTapeRef.push({
        'name': 'demo',
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
