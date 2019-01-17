var h = require('../helper/h');
var _ = require('../helper/util');
var patch = require('../../src/tree/patch');

describe("patch()", function() {

  it("patches arrays of virtual nodes", function() {

    var from = _.buildNodes(['#0', '#1']);
    var to = _.buildNodes(['#0', '#1', '#2', '#3']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('#0#1#2#3');

  });

  it("ignores `undefined` from `fromChildren` at the begining", function() {

    var from = _.buildNodes([undefined, '0', '1', '2']);
    var to = _.buildNodes(['1', '2']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('12');

  });

  it("ignores `null` from `fromChildren` at the begining", function() {

    var from = _.buildNodes([null, '0', '1', '2']);
    var to = _.buildNodes(['1', '2']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('12');

  });

  it("ignores `undefined` from `fromChildren` at the end", function() {

    var from = _.buildNodes(['0', '1', '2', undefined]);
    var to = _.buildNodes(['2', '1', '0', '3']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('2103');

  });

  it("ignores `null` from `fromChildren` at the end", function() {

    var from = _.buildNodes(['0', '1', '2', null]);
    var to = _.buildNodes(['2', '1', '0', '3']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('2103');

  });

  it("ignores `undefined` from `toChildren` at the begining", function() {

    var from = _.buildNodes(['0', '1', '2', '3']);
    var to = _.buildNodes([undefined, '0', '1']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('01');

  });

  it("ignores `null` from `toChildren` at the begining", function() {

    var from = _.buildNodes(['0', '1', '2', '3']);
    var to = _.buildNodes([null, '0', '1']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('01');

  });

  it("ignores `undefined` from `toChildren` at the end", function() {

    var from = _.buildNodes(['0', '1', '2']);
    var to = _.buildNodes(['2', '1', '0', undefined]);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('210');

  });

  it("ignores `null` from `toChildren` at the end", function() {

    var from = _.buildNodes(['0', '1', '2']);
    var to = _.buildNodes(['2', '1', '0', null]);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('210');

  });

  it("ignores `null` from `toChildren` on reverting order", function() {

    var from = _.buildNodes(['0', '1', '2']);
    var to = _.buildNodes(['2', null, '1', '0']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('210');

  });

  it("ignores `null` from `toChildren` and don't try to remove its associated element", function() {

    var from = _.buildNodes(['0', '1', null, '2']);
    var to = _.buildNodes(['0']);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('0');

  });

  it("ignores `null` from `fromChildren` when trying to build keys indexes", function() {

    var from = h({ tagName : "div" }, [h({ tagName : "div" }, ['div1']), null, h({ tagName : "div" }, ['div2'])]);
    var to = h({ tagName : "div" }, [h({ tagName : "span" }, ['span'])]);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('span');

  });

  it("ignores `undefined` from `fromChildren` when trying to build keys indexes", function() {

    var from = h({ tagName : "div" }, [h({ tagName : "div" }, ['div1']), undefined, h({ tagName : "div" }, ['div2'])]);
    var to = h({ tagName : "div" }, [h({ tagName : "span" }, ['span'])]);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);
    expect(rootNode.textContent).toBe('span');

  });

});
