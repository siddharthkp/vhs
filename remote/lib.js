'use strict';

var phantom = require('phantom');

/* Pre recorded vhs.events */
var testEvents = JSON.stringify(require('./test-events.json'));
var url = 'http://localhost:3000';

/* Create phantom instance */
phantom.create()
/* New page instance */
.then(function (instance) {
    return instance.createPage();
})
/* All console messages should come to terminal */
.then(function (page) {
    page.property('onConsoleMessage', function (message) {
        console.log(message);
    });
    page.property('onError', function (message) {
        console.log(message);
    });
    return page;
}).then(function (page) {
    return page.open(url).then(function () {
        return page;
    });
}).then(function (page) {
    /* Can execute functions in page.evaluate */
    return page.evaluate(function (testEvents) {
        localStorage.setItem('vhs', testEvents);
        window.vhs.setupPlayback();
        return 'done';
    }, testEvents);
}).then(function (res) {
    console.log('result', res);
    return page;
});
