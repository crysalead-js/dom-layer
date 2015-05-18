var jsdom = require('jsdom');

global.document = jsdom.jsdom();
global.window = global.document.parentWindow;

// Workaround for https://github.com/tmpvar/jsdom/issues/961
document.defaultView.HTMLElement.prototype.dataset = {};

require('./node/tag-spec');
require('./node/render-spec');
require('./node/patch-spec');
require('./node/remove-spec');
require('./node/setter/apply-props-spec');
require('./node/setter/apply-attrs-spec');
require('./node/setter/apply-attrs-n-s-spec');
require('./tree/tree-spec');
require('./tree/patch-spec');
