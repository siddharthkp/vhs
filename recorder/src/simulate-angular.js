const getElement = selector => {
    return angular.element(document.querySelector(selector));
}

const click = ({selector}, resolve) => {
    let element = getElement(selector);
    element.triggerHandler({type: 'click'});
    resolve();
};

const dblclick = ({selector}, resolve) => {
    let element = getElement(selector);
    element.triggerHandler({type: 'dblclick'});
    resolve();
};

const keypress = ({selector, which}, resolve) => {
    let element = getElement(selector);
    let currentValue = element.val();
    if (which === 8) {
        /* Manually handle backspace */
        element.val(currentValue.substring(0, currentValue.length-1));
    } else {
        let key = String.fromCharCode(which);
        /* Manually add charachter */
        element.val(currentValue + key);
    }
    /* Trigger event */
    element.triggerHandler({type: 'keydown', which});
    element.triggerHandler({type: 'keyup', which});
    element.triggerHandler({type: 'change'});
    if (resolve) resolve();
};

const keyCombo = ({selector, whichs}, resolve) => {
    /*
        Playing key events with a tiny gap
        for a smooth animation with the sidebar
        In remote mode, we can't see the UI,
        optimising for faster build times there.
    */
    let keyComboGap = 100;
        if (vhs.remote) keyComboGap = 0;

        let i = 0;
        let interval = window.setInterval(() => {
        if (!whichs[i]) {
            window.clearInterval(interval);
            resolve();
        } else {
            keypress({selector, which: whichs[i]});
            i++;
        }
    }, keyComboGap);
};

const wait = ({duration}, resolve) => {
    setTimeout(() => resolve(), duration);
};

module.exports = {
    click,
    dblclick,
    keypress,
    keyCombo,
    wait
}
