'use strict';

var phantom = require('phantom');
var clear = require('clear');
var http = require('http');
var nodeStatic = require('node-static');

var _require = require('chalk'),
    gray = _require.gray,
    yellow = _require.yellow,
    green = _require.green,
    red = _require.red;

var demo = new nodeStatic.Server('../demo');
var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        return demo.serve(request, response);
    }).resume();
}).listen(3000);

/* Pre recorded vhs.events */
var testEvents = JSON.stringify(require('./test-events.json'));
var url = 'http://localhost:3000';
if (process.env.CI) url = 'https://siddharthkp.github.io/vhs/demo';

var prettyOut = function prettyOut(message) {
    var events = [];
    try {
        events = JSON.parse(message);
    } catch (err) {
        console.log(red(message));
        process.exit(1);
    }
    var render = events.map(function (event) {
        var prettyEvent = event.index + ' ' + event.type + ' ' + (event.duration || event.key || '');
        if (event.status === 'pending') return gray(prettyEvent);else if (event.status === 'passed') return green(prettyEvent);else return gray(prettyEvent);
    });

    /* Skip continous rendering on CI as we can't clear() */
    if (!process.env.CI) {
        clear();
        console.log(render.join('\n'));
    }

    /* End of tests */
    if (events.pop().status !== 'pending') {
        clear();
        console.log(render.join('\n'));
        phantomInstance.exit();
        server.close();
    }
};

var phantomInstance = void 0;

/* Create phantom instance */
phantom.create([], {
    logger: { info: prettyOut }
})
/* New page instance */
.then(function (instance) {
    phantomInstance = instance;
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
        window.vhs.setupPlayback(true); // true for remote flag
        return 'done';
    }, testEvents);
}).then(function (res) {
    console.log(yellow('Running tests'));
});
