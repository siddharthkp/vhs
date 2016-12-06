const phantom = require('phantom');
const clear = require('clear');
const {gray, yellow, green} = require('chalk');

/* Pre recorded vhs.events */
const testEvents = JSON.stringify(require('./test-events.json'));
const url = 'http://localhost:3000';

const prettyOut = (message) => {
    clear();
    let events = JSON.parse(message);
    let render = events.map(event => {
        let prettyEvent = `${event.index} ${event.type} ${event.which}`;
        if (event.status === 'pending') return gray(prettyEvent)
        else if (event.status === 'passed') return green(prettyEvent)
        else return gray(prettyEvent);
    });
    console.log(render.join('\n'));
};

/* Create phantom instance */
phantom.create([], {
    logger: {info: prettyOut}
})
/* New page instance */
.then(instance => {
    return instance.createPage();
})
/* All console messages should come to terminal */
.then(page => {
    page.property('onConsoleMessage', (message) => {
        console.log(message);
    });
    page.property('onError', (message) => {
        //console.log(message);
    });
    return page;
})
.then(page => page.open(url).then(() => page))
.then(page => {
    /* Can execute functions in page.evaluate */
    return page.evaluate(function(testEvents) {
        localStorage.setItem('vhs', testEvents);
        window.vhs.setupPlayback();
        return 'done';
    }, testEvents);
})
.then(res => {
    console.log(res);
});
