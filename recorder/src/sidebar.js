const xpath = require('simple-xpath-position');
const visible = require('withinviewport');
window.visble = visible;

const show = () => {
    $('body').append(html);
};

const render = (events, lastEventIndex) => {
    $('.vhs-sidebar-events').empty();
    for (let i = 0; i < events.length; i++) addEvent(events[i], i <= lastEventIndex ? 'passed': 'pending');
    followLogs();
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

const addEvent = (event, status) => {
    event.status = status;
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
        width: 300px;
        height: 100%;
        z-index: 999;
        background: #253447;
        border-left: 1px solid #1C2939;
        overflow-y: auto;
        color: #FFF;
        font-size: 14px;
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
        margin: 2px 5px;
    }
    .vhs-sidebar-event-pending {
        color: #707C88;
    }
    .vhs-sidebar-event-pending .vhs-sidebar-status {
        background-color: #707C88;
    }
    .vhs-sidebar-event-passed {
        color: #2EAADE;
    }
    .vhs-sidebar-event-passed .vhs-sidebar-status {
        background-color: #2EAADE;
    }
    .vhs-sidebar-event-failed .vhs-sidebar-status {
        background-color: red;
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

const getNewEventHTML = ({type, duration, key, identifier, status}) => {
    return `
        <div class="vhs-sidebar-event vhs-sidebar-event-${status}">
            <span class="vhs-sidebar-status"></span>
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
