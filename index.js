var Tree = require("./tree/tree");
var attach = require("./tree/attach");
var create = require("./tree/create");
var update = require("./tree/update");
var remove = require("./tree/remove");
var patch = require("./tree/patch");
var Tag = require("./node/tag");
var Text = require("./node/text");
var attrs = require("./node/patcher/attrs");
var attrsNS = require("./node/patcher/attrs-n-s");
var props = require("./node/patcher/props");
var events = require("./events");

module.exports = {
  Tree: Tree,
  Tag: Tag,
  Text: Text,
  attach: attach,
  create: create,
  update: update,
  remove: remove,
  patch: patch,
  attrs: attrs,
  attrsNS: attrsNS,
  props: props,
  events: events
};
