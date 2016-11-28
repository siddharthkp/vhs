/* Lib to get xpath for a DOM node */
const xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

/* Whitelist of DOM events that are recorded */
const eventTypes = ['click'];

const events = [];

/* Create event handlers for each event type - call `record` function */
const getEventHandlers = () => {
    let handlers = {};
    eventTypes.map(type => handlers[type] = record);
    return handlers;
};

const attachHandlers = () => {
    let handlers = getEventHandlers();
    $('html').on(handlers);
};

const detachHandlers = () => {
    let handlers = getEventHandlers();
    $('html').off(handlers);
};

const record = (event) => {
    /* Only record whitelisted event types */
    if (!eventTypes.includes(event.type)) return;

    /*
     * We want to get the xpath of the DOM element.
     *
     * Depending on the interface, the element might or
     * might not stay in the DOM tree after the event.
     *
     * We need to hijack the event, run our code first
     * and then play the event.
     */
    event.preventDefault();

    /* Adding a wait before each user event */
    events.push(getWaitEvent());

    let syntheticEvent = {
        type: event.type,
        which: event.which,
        path: xpath.fromNode(event.target, document)
    };
    events.push(syntheticEvent);

    /* Playing our event */
    playEvent(syntheticEvent);
};

let lastEventTimestamp;
const getWaitEvent = () => {
    let now = new Date().getTime();
    let event = {
        type: 'wait',
        /* Return time since last event */
        duration: (now - lastEventTimestamp) || 0
    };

    lastEventTimestamp = now;
    return event;
};

const getElement = (path) => {
    return xpath.toNode(path, document);
};

/* Play an event */
const playEvent = (event) => {
    // TODO: Simplify this function with async-await
    return new Promise(resolve => {
        /*
         * Don't want synthetic events to be recorded while when we play them.
         * We will end up in an infinite loop otherwise
        */
        detachHandlers();

        /*
        * All events return a promise which is resolved after
        * the event is completed. Useful for wait events
        */
        new Promise((resolve, reject) => {
            let type = event.type;
            // TODO: Create an event map for events
            if (type === 'click') click(event, resolve);
            else if (type === 'keypress') keypress(event, resolve);
            else if (type === 'wait') wait(event, resolve);
            else reject(new Error('Unknown event type. Could not play'));
        }).then(() => {
            /* Re-attach handlers after event is played */
            attachHandlers();
            resolve();
        });
    });
};

/*
 * Simulate events
 * Each handler gets the event object
 * and the resolve function for it's promise
 * resolve() must be called at the end of the function
 */

const click = ({path}, resolve) => {
    let element = getElement(path);
    $(element).trigger('click');
    resolve();
};

const keypress = ({path, which},resolve) => {
    let element = getElement(path);
    let key = String.fromCharCode(event.which);
    // Simulate keypress
    resolve();
};

const wait = ({duration}, resolve) => {
    setTimeout(() => resolve(), duration);
};

/* Play all recorded events */
const play = () => playEventsRecursively(0);

const playEventsRecursively = (index) => {
    if (!events[index]) return;
    playEvent(events[index]).then(() => playEventsRecursively(++index));
};

$(() => {
    /* Expose public functions */
    window.vhs = {
        play,
        events,
        record: attachHandlers,
        stop: detachHandlers //TODO: Change ambiguous name
    }
});

