const xpath = require('simple-xpath-position');
const visible = require('withinviewport');
window.visble = visible;

const show = () => {
    $('body').append(html);
};

let events = [];

const render = (eventsArray, lastEventIndex) => {
    $('.vhs-sidebar-events').empty();
    events = eventsArray;
    for (let i = 0; i < events.length; i++) addEvent(i, lastEventIndex);
    renderOnConsole(events);
    followLogs();
};

/* Used in remote mode for display */
const renderOnConsole = (events) => {
    console.clear();
    console.log(JSON.stringify(events));
};

const followLogs = () => {
    let latestPassedTest = $('.vhs-sidebar-event-passed').last();
    if (!latestPassedTest.length) return;

    if (!visible(latestPassedTest)) {
        let scrollTop  = $('.vhs-sidebar').scrollTop();
        $('.vhs-sidebar').stop().animate({
            scrollTop: scrollTop + 500
        });
    }
};

const addEvent = (index, lastEventIndex) => {
    let event = events[index];
    event.index = index;

    if (event.paused) event.status = 'paused';
    else event.status = index <= lastEventIndex ? 'passed': 'pending';


    if (event.type === 'wait' && event.duration < 300) return;

    event.identifier = getPrettyIdentifier(event.path);

    if (event.which === 1) delete event.which; // click events
    if (event.which) event.key = getPrettyKey(event.which);

    $('.vhs-sidebar-events').append(getNewEventHTML(event));
};

const getPrettyIdentifier = (path) => {
    let identifier = '';
    if (!path) return identifier;

    let element = xpath.toNode(path, document);
    if (!element) {
        return identifier;
    }

    identifier += element.tagName ? `${element.tagName}`: '';
    identifier += element.id ? `#${element.id}`: '';
    identifier += element.className ? `.${element.className}`: '';
    identifier += element.text ? `(${element.text})`: '';
    return identifier;
};

const getPrettyKey = (which) => {
    let map = {
        8: '←',
        13: '↵',
        32: '_' //proxy for space
    }
    return map[which] || String.fromCharCode(which);
};

const styles = `<style>
    .vhs-sidebar {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        z-index: 999;
        background: #253447;
        border-left: 1px solid #1C2939;
        overflow-y: auto;
        color: #FFF;
        font-size: 14px;
        font-family: monospace;
    }
    .vhs-sidebar-header {
        background: #1C2939;
        padding: 20px 30px;
        font-size: 18px;
    }
    .vhs-sidebar-event {
        overflow: hidden;
        padding: 10px;
    }
    .vhs-sidebar-event-type, .vhs-sidebar-event-key {
        float: right;
    }
    .vhs-sidebar-event-key {
        color: #D2426E;
        background: #F7F7F9;
        border: 1px solid #DDD;
        border-radius: 3px;
        padding: 0 3px;
        margin-left: 5px;
        display: inline;
    }
    .vhs-sidebar-status {
        display: inline-block;
        width: 7.5px;
        height: 7.5px;
        border-radius: 50%;
        margin: 0 5px;
    }
    .vhs-sidebar-event-pending {
        color: #707C88;
    }
    .vhs-sidebar-event-pending .vhs-sidebar-status {
        background-color: #707C88;
    }
    .vhs-sidebar-event-passed {
        color: #8EDFBA;
    }
    .vhs-sidebar-event-passed .vhs-sidebar-status {
        background-color: #8EDFBA;
    }
    .vhs-sidebar-event-failed .vhs-sidebar-status {
        background-color: red;
    }
    .vhs-sidebar-event-paused {
        color: #ffd590;
    }
    .vhs-sidebar-event-paused .vhs-sidebar-status {
        background-color: #ffd590;
    }
</style>`;

const html = `
    <div class="vhs-sidebar">
        ${styles}
        <div class="vhs-sidebar-header">
            Events
        </div>
        <div class="vhs-sidebar-events">

        </div>
    </div>
`;

const getDetailHTML = (data, type) => {
    if (!data) return ``;
    if (type === 'duration') data = `&#128337; ${data}`;
    return `<span class="vhs-sidebar-event-${type}">${data}</span>`;
};

const getNewEventHTML = ({type, duration, key, identifier, status, index}) => {
    return `
        <div
            class="vhs-sidebar-event vhs-sidebar-event-${status}"
            data-index=${index}
            >
            <span class="vhs-sidebar-status" onclick="vhs.debug(${index})"></span>
            ${getDetailHTML(identifier, 'identifier')}
            ${getDetailHTML(duration, 'duration')}

            ${getDetailHTML(key, 'key')}
            ${getDetailHTML(type, 'type')}
        </div>
    `;
};

const toggleBreakpoint = (index) => {
    let selector = `.vhs-sidebar-event[data-index=${index}]`;
    $(selector).toggleClass('vhs-sidebar-event-paused');

    /* Set pending or passed state based on lastPassedTest */
    let lastPassedTest = $('.vhs-sidebar-event-passed').last();
    if (index < lastPassedTest.data('index')) $(selector).toggleClass('vhs-sidebar-event-passed');
    else $(selector).toggleClass('vhs-sidebar-event-pending');
};

module.exports = {
    show,
    render,
    toggleBreakpoint
}
