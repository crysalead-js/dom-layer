require('document-register-element') // document.registerElement polyfill

document.addEventListener('DOMContentLoaded', function(event) {
  var test = document.createElement('div');
  test.id = 'test';
  document.body.appendChild(test);
});

require('./node/tag-spec');
require('./node/text-spec');
require('./node/render-spec');
require('./tree/patch-spec');
require('./tree/patch-node-spec');
require('./tree/patch-node-reordering-spec');
require('./node/remove-spec');
require('./node/patcher/props-spec');
require('./node/patcher/attrs-spec');
require('./node/patcher/attrs-n-s-spec');
require('./node/patcher/select-value-spec');
require('./tree/patch-spec');
require('./tree/tree-spec');

