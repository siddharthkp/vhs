const appConfig = require('../.firebaseconfig.json');
firebase.initializeApp(appConfig);
const newTapeRef = firebase.database().ref('tapes');

const storeTape = (tape) => {
    console.log(tape);
    newTapeRef.push({
        'name': 'demo',
        'events': tape
    }).then(function (argument) {
        console.log('cool');
    });
}

module.exports = {
    storeTape
}