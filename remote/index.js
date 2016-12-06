const page = require('webpage').create();
const testEvents = JSON.stringify(require('./test-events.json'));
const url = 'http://localhost:3000';

page.open(url, function(status) {
    /* Time out for page load complete */
    window.setTimeout(function () {
        /*
        * Execute functions on the page using evaluate
        * Passing testEvents as a variable
        */
        page.evaluate(function(testEvents) {
            localStorage.setItem('vhs', testEvents);
            window.vhs.setupPlayback();
        }, testEvents);

        /* All done, bye */
        phantom.exit();
    }, 1000);
});
