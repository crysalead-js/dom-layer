var jsdom = require('jsdom');

global.document = jsdom.jsdom();
global.window = global.document.parentWindow;

// Workaround for https://github.com/tmpvar/jsdom/issues/961
document.defaultView.HTMLElement.prototype.dataset = {};

require('./node/tag-spec');
require('./node/render-spec');
require('./node/patch-spec');
require('./node/remove-spec');
require('./node/patcher/props-spec');
require('./node/patcher/attrs-spec');
require('./node/patcher/attrs-n-s-spec');
require('./util/value-equal-spec');
require('./tree/tree-spec');
require('./tree/patch-spec');
