var domElementValue = require('dom-element-value');
var EventManager = require('dom-event-manager');

var eventManager;

function eventHandler(name, e) {
  var element = e.delegateTarget, eventName = 'on' + name;
  if (!element.domLayerNode || !element.domLayerNode.events || !element.domLayerNode.events[eventName]) {
    return;
  }

  var value;
  if (/^(?:input|select|textarea|button)$/i.test(element.tagName)) {
    value = domElementValue(element);
  }
  return element.domLayerNode.events[eventName](e, value, element.domLayerNode);
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
