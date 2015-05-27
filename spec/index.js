require("document-register-element") // document.registerElement polyfill

document.addEventListener("DOMContentLoaded", function(event) {
  var test = document.createElement("div");
  test.id = "test";
  document.body.appendChild(test);
});

require('./node/tag-spec');
require('./node/text-spec');
require('./node/render-spec');
require('./node/patch-spec');
require('./node/remove-spec');
require('./node/patcher/props-spec');
require('./node/patcher/attrs-spec');
require('./node/patcher/attrs-n-s-spec');
require('./tree/patch-spec');
require('./tree/tree-spec');

