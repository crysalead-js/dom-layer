var EventManager = require('dom-event-manager');

var eventManager;

function eventHandler(name, e) {
  var element = e.delegateTarget;

  if (!element.domLayerNode || !element.domLayerNode.events) {
    return;
  }

  var events = []
  var mouseClickEventName;
  var bail = false;

  if (name.substr(name.length - 5) === 'click') {
    mouseClickEventName = 'onmouse' + name;
    if (element.domLayerNode.events[mouseClickEventName]) {
      events.push(mouseClickEventName);
    }
    // Do not call the `click` handler if it's not a left click.
    if (e.button !== 0 && name.substr(0, 3) !== 'aux') {
      bail = true;
    }
  }

  var eventName;
  if (!bail) {
    eventName = 'on' + name;
    if (element.domLayerNode.events[eventName]) {
      events.push(eventName);
    }
  }

  if (!events.length) {
    return;
  }

  for (var i = 0, len = events.length; i < len ; i++) {
    element.domLayerNode.events[events[i]](e, element.domLayerNode);
  }
}

function getManager() {
  if (eventManager) {
    return eventManager;
  }
  return eventManager = new EventManager(eventHandler);
}

function init() {
  var em = getManager();
  em.bindDefaultEvents();
  return em;
}

module.exports = {
  EventManager: EventManager,
  getManager: getManager,
  init: init
};
