var jsdom = require('jsdom');

global.document = jsdom.jsdom();
global.window = global.document.parentWindow;

require('./node/tag-spec.js');
require('./node/render-spec.js');
require('./node/patch-spec.js');
require('./node/setter/apply-props-spec');
require('./node/setter/apply-attrs-spec');
require('./tree/patch/patch-spec');
