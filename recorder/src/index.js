const cssSelectorGenerator = require('css-selector-generator').CssSelectorGenerator;
const selectorGenerator = new cssSelectorGenerator();

/* Polyfill for Array.prototype.includes */
require('core-js/fn/array/includes');
/* jQuery helper lib */
require('./bind-first');
/* vhs modules */
const controls = require('./controls');
const sidebar = require('./sidebar');
const store = require('./store');
const {click, dblclick, keypress, keyCombo, wait} = require('./simulate');

/* Whitelist of DOM events that are recorded */
const eventTypes = ['click', 'keypress', 'dblclick'];

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

const wrapBodyInRecordable = () => {
    $('body').wrapInner('<div class="vhs-recordable"></div>')
};

const attachHandlers = () => {
    let handlers = getEventHandlers();
    window.handlers = handlers;
    $('.vhs-recordable').onFirst(handlers);
};

const detachHandlers = () => {
    let handlers = getEventHandlers();
    $('.vhs-recordable').off(handlers);
};

const recordEvent = (event) => {
    /* Only record whitelisted event types */
    if (!eventTypes.includes(event.type)) {
        /* Some events like keydown need special treatment */
        if (specialEventTypes.includes(event.type)) handleHacks(event);
        return;
    }

    /*
     * We want to get the query selector of the DOM element.
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
        selector: getSelector(event.target)
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

const getSelector = (element) => {
    let selector = selectorGenerator.getSelector(element, {
        ignore: {
            attribute (name, value, defaultPredicate) {
                // exclude HTML5 data attributes
                return (/data-*/).test(name) || defaultPredicate(name, value)
            }
        }
    });
    return selector;
}

/* Play an event */
const playEvent = (event) => {
    // TODO: Simplify this function with async-await
    return new Promise(resolve => {
        /*
         * Don't want synthetic events to be recorded while when we play them.
         * We will end up in an infinite loop otherwise
        */
        stopRecording();

        /* In debug mode, don't play the event.
         * Not resolving the promise freezes the playback on this step
         * To replay again, call playEvent with the next event explicitly
         */
        if (event.paused) {
            vhs.paused_at = event.index;
            controls.togglePausedState();
            return;
        }

        /*
        * All events return a promise which is resolved after
        * the event is completed. Useful for wait events
        */
        new Promise((resolve, reject) => {
            let type = event.type;
            // TODO: Create an event map for events
            if (type === 'click') click(event, resolve);
            if (type === 'dblclick') dblclick(event, resolve);
            else if (type === 'keypress') keypress(event, resolve);
            else if (type === 'key-combo') keyCombo(event, resolve);
            else if (type === 'wait') wait(event, resolve);
            else reject(new Error(`Unknown event type: ${type}. Could not play`));
        }).then(() => {
            /* Re-attach handlers after event is played */
            resumeRecording(); //TODO: Don't attach in playback mode
            resolve();
        });
    });
};

/* Play all recorded events */
const play = () => {
    controls.togglePlayingState();
    playEventsRecursively(0);
}

const setupPlayback = (remote) => {
    /* Stop and persist recording */
    if (isRecording) toggleRecording();

    /* Using localStorage as a persistent storage */
    localStorage.setItem('vhs-playback', true);
    if (remote) localStorage.setItem('vhs-remote', true);

    location.reload();
};

const initPlayback = () => {
    events = JSON.parse(localStorage.getItem('vhs')).events;
    sidebar.show();
    sidebar.render(events);

    let remote = localStorage.getItem('vhs-remote');
    if (remote) vhs.remote = true;

    play();
    localStorage.removeItem('vhs-playback');
    localStorage.removeItem('vhs-remote');
};

const resumePlayback = () => {
    let index = vhs.paused_at;
    controls.togglePausedState();
    playEventsRecursively(++index);
};

const playEventsRecursively = (index) => {
    if (!events[index]) {
        controls.togglePlayingState();
        return;
    }
    /*
     * It's useful to re-render the sidebar because
     * the element in an event might only enter the DOM
     * after it's previous event.
     * Passing last event index for marking progress
     */
    sidebar.render(events, index);

    /* Play event */
    playEvent(events[index]).then(() => playEventsRecursively(++index));
};

let isRecording = false;
const toggleRecording = () => {
    if (isRecording) stopRecording();
    else record();
    controls.toggleRecordingState();
};

const saveRecording = () => {
    if (isRecording) toggleRecording();
    /* Fetch locally persisted events */
    let events = JSON.parse(localStorage.getItem('vhs')).events;
    let name = prompt("What do you want to name this test?");
    store.save(name, events);
};

let eventsFlattened = false;
const record = () => {
    events = [];
    if (!eventsFlattened) flattenAppEvents(); /* Run only once */
    resumeRecording();

};

/*
    DOM events are fired in the order of specificity.

    If the application's events are bound to individual elements,
    they will fire first. This might break the recording in some cases
    where the element is removed from the DOM after the app's event.

    To fix this,
    1. We need to standardise the specificity of all the events by
    removing all the events from individual elements and attaching them to
    the document.
    2. Attach our events such that they take precedence using onFirst

    This might lead to a degraded performance of the app in record mode.

    flattenAppEvents implements the first step.
*/

const flattenAppEvents = () => {
    let flatEvents = [];
    let allElements = $('*');
    for (let i = 0; i < allElements.length; i++) {
        let element = allElements[i];
        let eventHandlers = $._data(element).events;
        if (eventHandlers) {
            let eventTypes = Object.keys(eventHandlers);
            for (let type of eventTypes) {
                let events = eventHandlers[type];
                for (let j = 0; j < events.length; j++) {
                    let event = events[j];
                    let selector = getSelector(element); // parent
                    if (event.selector) selector += ' ' + event.selector; // child
                    flatEvents.push({
                        selector: selector,
                        type: event.type,
                        handler: event.handler
                    });
                }
            }
        }
    }

    /* Unbind all events */
    $(document).find('*').off();
    /* Re-attach on document */
    for (let {type, selector, handler} of flatEvents) $(document).on(type, selector, handler);
    eventsFlattened = true;
}

const stopRecording = () => {
    detachHandlers();
    isRecording = false;
    persistEventsLocally();
};


const persistEventsLocally = () => {
    events = minify(events);
    localStorage.setItem('vhs', JSON.stringify({events}));
};

const minify = (rawEvents) => {
    let events = [];
    events = removeTinyWaitEvents(rawEvents);
    events = mergeSubsequentKeyEvents(events);
    return events;
}

const removeTinyWaitEvents = (events) => {
    return events.filter(({type, duration}) => type !== 'wait' || duration > 300);
};

const mergeSubsequentKeyEvents = (events) => {
    if (events.length < 1) return events;
    for (let i = 0; i < events.length - 1; i++) {
        let event = events[i];
        let nextEvent = events[i + 1];
        if (['keypress', 'key-combo'].indexOf(event.type) !== -1 && nextEvent.type === 'keypress') {
            if (isMergeable(event.which) && isMergeable(nextEvent.which)) {
                event.type = 'key-combo';
                if (!event.whichs) event.whichs = [event.which];
                event.whichs = [...event.whichs, nextEvent.which];
                delete event.which;
                events.splice(i + 1, 1);
                i--;
            }
        }
    }
    return events;
}

const isMergeable = (key) => {
    return [8, 13].indexOf(key) === -1;
}

const resumeRecording = () => {
    attachHandlers();
    isRecording = true;
};

const debug = (index) => {
    events[index].paused = !!!events[index].paused; // Toggle pause after this event
    persistEventsLocally();
    sidebar.toggleBreakpoint(index);
}

$(() => {
    /* Expose public functions */
    window.vhs = {
        events,
        toggleRecording,
        setupPlayback,
        debug,
        resumePlayback,
        saveRecording,
        flattenAppEvents
    }
    wrapBodyInRecordable();
    controls.show();

    let playback = localStorage.getItem('vhs-playback');

    if (playback) initPlayback();
});
