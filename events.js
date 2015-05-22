var domElementValue = require("dom-element-value");
var EventManager = require("dom-event-manager");

var eventManager;

function eventHandler(name, e) {
  var element = e.delegateTarget, eventName = "on" + name;
  if (!element.domLayerNode || !element.domLayerNode.events || !element.domLayerNode.events[eventName]) {
    return;
  }

  var value;
  if (/^(?:input|select|textarea|button)$/i.test(element.tagName)) {
    value = domElementValue(element);
  }
  return element.domLayerNode.events[eventName](e, value);
}

function init() {
  if (eventManager) {
    return eventManager;
  }
  eventManager = new EventManager(eventHandler);
  eventManager.bindDefaultEvents();
  return eventManager;
}

module.exports = {
  init: init
};
