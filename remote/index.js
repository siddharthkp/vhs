const phantom = require('phantom');
const clear = require('clear');
const {gray, yellow, green, red} = require('chalk');

let url;
let server;

if (process.env.local) {
    server = require('./test-server.js');
    url = 'http://localhost:3001';
} else url = process.env.url;

/* Pre recorded vhs.events */
const testEvents = JSON.stringify(require('./test-events.json'));

const prettyOut = (message) => {
    let events = [];
    try {
        events = JSON.parse(message);
    } catch (err) {
        console.log(red(message));
        process.exit(1);
    }
    let render = events.map(event => {
        let prettyEvent = `${event.index} ${event.type} ${event.duration || event.key || ''}`;
        if (event.status === 'pending') return gray(prettyEvent)
        else if (event.status === 'passed') return green(prettyEvent)
        else return gray(prettyEvent);
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
        terminateTests();
    }
};

let phantomInstance;

/* Create phantom instance */
phantom.create([], {
    logger: {info: prettyOut}
})
/* New page instance */
.then(instance => {
    phantomInstance = instance;
    return instance.createPage();
})
/* All console messages should come to terminal */
.then(page => {
    page.property('onConsoleMessage', (message) => {
        console.log(message);
    });
    page.property('onError', (message) => {
        console.log(message);
    });
    return page;
})

.then(page => page.open(url).then(() => page))
.then(page => {
    /* Can execute functions in page.evaluate */
    return page.evaluate(function(testEvents) {
        localStorage.setItem('vhs', testEvents);
        window.vhs.setupPlayback(true); // true for remote flag
        return 'done';
    }, testEvents);
})
.then(res => {
    console.log(yellow('Running tests'));
});

let terminateTests = () => {
    phantomInstance.process.kill();
    phantomInstance.exit();
    if (process.env.local) server.close();
}

process.on('exit', terminateTests);
process.on('SIGINT', terminateTests);
