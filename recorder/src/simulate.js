/*
 * Simulate events
 * Each handler gets the event object
 * and the resolve function for it's promise
 * resolve() must be called at the end of the function
 */

let simulate = {};
if (window.angular) simulate = require('./simulate-angular');
else if (window.jQuery) simulate = require('./simulate-jquery');

module.exports = {
    click: simulate.click,
    dblclick: simulate.dblclick,
    keypress: simulate.keypress,
    keyCombo: simulate.keyCombo,
    wait: simulate.wait
}
