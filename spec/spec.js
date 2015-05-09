var jsdom = require('jsdom');

global.document = jsdom.jsdom();
global.window = global.document.parentWindow;

require('./node/tag-spec');
require('./node/render-spec');
require('./node/patch-spec');
require('./node/setter/apply-props-spec');
require('./node/setter/apply-attrs-spec');
require('./node/setter/apply-attrs-n-s-spec');
require('./tree/tree-spec');
require('./tree/patch-spec');
