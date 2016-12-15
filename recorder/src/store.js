const config = require('./config.json');

const firebase = require('firebase');
firebase.initializeApp(config);

const dbLocation = config.databaseURL;
const newTapeRef = firebase.database().ref('tapes');

const save = (name, events) => {
    newTapeRef.push({
        'name': name || 'Anonymous', //TODO: Change the name to name of the test
        'events': events
    });
}

// Usage: store.get().then((data)=>{//Play with data})
const get = () => {
    return $.get(`${dbLocation}/tapes.json`).promise();
}

module.exports = {
    save,
    get
}
