'use strict';

var phantom = require('phantom');
var clear = require('clear');

var _require = require('chalk'),
    gray = _require.gray,
    yellow = _require.yellow,
    green = _require.green;

/* Pre recorded vhs.events */


var testEvents = JSON.stringify(require('./test-events.json'));
var url = 'https://siddharthkp.github.io/vhs/demo';

var prettyOut = function prettyOut(message) {
    clear();
    var events = JSON.parse(message);
    var render = events.map(function (event) {
        var prettyEvent = event.index + ' ' + event.type + ' ' + event.which;
        if (event.status === 'pending') return gray(prettyEvent);else if (event.status === 'passed') return green(prettyEvent);else return gray(prettyEvent);
    });
    console.log(render.join('\n'));
};

/* Create phantom instance */
phantom.create([], {
    logger: { info: prettyOut }
})
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
        //console.log(message);
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
    console.log(res);
});
