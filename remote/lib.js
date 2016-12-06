'use strict';

var page = require('webpage').create();
var testEvents = JSON.stringify(require('./test-events.json'));
var url = 'http://localhost:3000';

page.open(url, function (status) {
    /* Time out for page load complete */
    window.setTimeout(function () {
        /*
        * Execute functions on the page using evaluate
        * Passing testEvents as a variable
        */
        var complete = page.evaluate(function (testEvents) {
            localStorage.setItem('vhs', testEvents);
            console.log(window.vhs.setupPlayback);
            //window.vhs.setupPlayback();
        }, testEvents);

        console.log(complete);

        /* All done, bye */
        phantom.exit();
    }, 1000);
});
