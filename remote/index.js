const phantom = require('phantom');

/* Pre recorded vhs.events */
const testEvents = JSON.stringify(require('./test-events.json'));
const url = 'http://localhost:3000';

/* Create phantom instance */
phantom.create()
/* New page instance */
.then(instance => instance.createPage())
/* All console messages should come to terminal */
.then(page => {
    page.property('onConsoleMessage', (msg) => {
        console.log(msg);
    });
    page.property('onError', (msg) => {
        console.log(msg);
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
.then((res) => {
    console.log('result', res);
    return page;
});
