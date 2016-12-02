const appConfig = require('../firebaseconfig.json');
firebase.initializeApp(appConfig);
const dbLocation = appConfig.databaseURL;
const newTapeRef = firebase.database().ref('tapes');

const storeTape = (tape) => {
    newTapeRef.push({
        'name': 'demo',
        'events': tape
    }).then(function (argument) {
        console.log('cool');
    });
}

const fetchTapes = () => {
    return fetch(`${dbLocation}/tapes.json`); 
}

module.exports = {
    storeTape,
    fetchTapes
}