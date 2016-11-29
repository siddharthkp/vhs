/* Lib to get xpath for a DOM node */
const xpath = require('simple-xpath-position');

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');

/* Whitelist of DOM events that are recorded */
const eventTypes = ['click', 'keypress'];

/* Hacky events */
const specialEventTypes = ['keydown'];

let events = [];

/* Create event handlers for each event type - call `record` function */
const getEventHandlers = () => {
    let handlers = {};
    eventTypes.map(type => handlers[type] = recordEvent);
    specialEventTypes.map(type => handlers[type] = recordEvent);
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

const recordEvent = (event) => {
    /* Only record whitelisted event types */
    if (!eventTypes.includes(event.type)) {
        /* Some events like keydown need special treatment */
        if (specialEventTypes.includes(event.type)) handleHacks(event);
        return;
    }

    /*
     * We want to get the xpath of the DOM element.
     *
     * Depending on the interface, the element might or
     * might not stay in the DOM tree after the event.
     *
     * We need to hijack the event, run our code first
     * and then play the event.
     */
    if (event.preventDefault) event.preventDefault();

    /* Adding a wait before each user event */
    events.push(getWaitEvent());

    let syntheticEvent = {
        type: event.type,
        which: event.which,
        path: xpath.fromNode(event.target, document)
    };
    events.push(syntheticEvent);

    if (!event.hacky) playEvent(syntheticEvent);
};

const handleHacks = (event) => {
    /* The keypress event does not catch back space key */
    if (event.type === 'keydown' && event.which === 8) backspaceHack(event);
};

const backspaceHack = ({which, target}) => {
    let customEvent = {
        type: 'keypress',
        which,
        target,
        hacky: true
    };
    recordEvent(customEvent);
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
        stopRecording();

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
            resumeRecording(); //TODO: Don't attach in playback mode
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
    let currentValue = $(element).val();
    if (which === 8) {
        /* Manually handle backspace */
        $(element).val(currentValue.substring(0, currentValue.length-1));
    } else {
        let key = String.fromCharCode(which);
        /* Manually add charachter */
        $(element).val(currentValue + key);
    }
    /* Trigger event */
    $(element).trigger(jQuery.Event('keydown', {which}));
    $(element).trigger(jQuery.Event('keyup', {which}));
    resolve();
};

const wait = ({duration}, resolve) => {
    setTimeout(() => resolve(), duration);
};

/* Play all recorded events */
const play = () => {
    events = JSON.parse(localStorage.getItem('vhs')).events;
    playEventsRecursively(0);
}

const playEventsRecursively = (index) => {
    if (!events[index]) {
        return;
    }
    playEvent(events[index]).then(() => playEventsRecursively(++index));
};

let isRecording = false;
const record = () => {
    events = [];
    resumeRecording();
};

const stopRecording = () => {
    detachHandlers();
    isRecording = false;
    localStorage.setItem('vhs', JSON.stringify({events}));
};

const resumeRecording = () => {
    attachHandlers();
    isRecording = true;
};

$(() => {
    /* Expose public functions */
    window.vhs = {
        play,
        events,
        record: record,
        stop: stopRecording //TODO: Change ambiguous name
    }
});