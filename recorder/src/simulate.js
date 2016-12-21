/*
 * Simulate events
 * Each handler gets the event object
 * and the resolve function for it's promise
 * resolve() must be called at the end of the function
 */

const simulate = require('./jquery-simulate-wrapper');

module.exports = {
    click: simulate.click,
    dblclick: simulate.dblclick,
    keypress: simulate.keypress,
    keyCombo: simulate.keyCombo,
    wait: simulate.wait
}
