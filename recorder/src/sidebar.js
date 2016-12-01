const xpath = require('simple-xpath-position');

const show = () => {
    $('body').append(html);
};

const render = (events, lastEventIndex) => {
    $('.vhs-sidebar-events').empty();
    for (let i = 0; i < events.length; i++) addEvent(events[i], i <= lastEventIndex);
};

const addEvent = (event, passed) => {
    event.passed = passed;
    if (event.type === 'wait' && event.duration < 100) return;
    event.identifier = getPrettyIdentifier(event.path);
    if (event.which === 1) delete event.key; // click event
    else if (event.which === 13) event.key = '↵';
    else if (event.which === 8) event.key = '←';
    else if (event.which === 32) event.key = '_'; //proxy for space
    else if (event.which) event.key = String.fromCharCode(event.which);

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

const styles = `<style>
    .vhs-sidebar {
        position: absolute;
        top: 0;
        right: 0;
        width: 250px;
        height: 100%;
        z-index: 999;
        background: #FFF;
        border-left: 1px solid #DDD;
        overflow-y: auto;
        //opacity: 0.25;
    }
    .vhs-sidebar:hover {
        opacity: 1;
    }
    .vhs-sidebar-event {
        overflow: hidden;
        border-bottom: 1px solid #DDD;
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
        width: 5px;
        height: 5px;
        border-radius: 50%;
        margin: 2.5px 5px;
    }
    .vhs-sidebar-status-pending {
        background-color: orange;
    }
    .vhs-sidebar-status-passed {
        background-color: green;
    }
    .vhs-sidebar-status-failed {
        background-color: red;
    }
</style>`;

const html = `
    <div class="vhs-sidebar">
        ${styles}
        <div class="vhs-sidebar-events">

        </div>
    </div>
`;

const getStatusHTML = (passed) => {
    let status = 'pending';
    if (passed) status = 'passed';
    return `<span class="vhs-sidebar-status vhs-sidebar-status-${status}"></span>`;
};

const getDetailHTML = (data, type) => {
    if (!data) return ``;
    if (type === 'duration') data = `&#128337; ${data}`;
    return `<span class="vhs-sidebar-event-${type}">${data}</span>`;
};

const getNewEventHTML = ({type, duration, key, identifier, passed}) => {
    return `
        <div class="vhs-sidebar-event">
            ${getStatusHTML(passed)}
            ${getDetailHTML(identifier, 'path')}
            ${getDetailHTML(duration, 'duration')}

            ${getDetailHTML(key, 'key')}
            ${getDetailHTML(type, 'type')}
        </div>
    `;
};

module.exports = {
    show,
    render
}
