var Tree = require("./src/tree/tree");
var attach = require("./src/tree/attach");
var render = require("./src/tree/render");
var update = require("./src/tree/update");
var remove = require("./src/tree/remove");
var patch = require("./src/tree/patch");
var Tag = require("./src/node/tag");
var Text = require("./src/node/text");
var attrs = require("./src/node/patcher/attrs");
var attrsNS = require("./src/node/patcher/attrs-n-s");
var props = require("./src/node/patcher/props");
var events = require("./src/events");

module.exports = {
  Tree: Tree,
  Tag: Tag,
  Text: Text,
  attach: attach,
  render: render,
  update: update,
  remove: remove,
  patch: patch,
  attrs: attrs,
  attrsNS: attrsNS,
  props: props,
  events: events
};
