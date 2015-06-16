var h = require("../helper/h");
var _ = require("../helper/util");
var patch = require("../../src/tree/patch");

describe("patch.node()", function() {

  describe("when using regular nodes", function() {

    it("adds all nodes", function() {

      var from = _.buildNodes([]);
      var to = _.buildNodes(["#0", "#1", "#2", "#3"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('#0#1#2#3');

    });

    it("sizes up", function() {

      var from = _.buildNodes(["#0", "#1"]);
      var to = _.buildNodes(["#0", "#1", "#2", "#3"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('#0#1#2#3');

    });

    it("sizes down", function() {

      var from = _.buildNodes(["#0", "#1", "#2", "#3"]);
      var to = _.buildNodes(["#0", "#1"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('#0#1');

    });

    it("clears all nodes", function() {

      var from = _.buildNodes(["#0", "#1", "#2", "#3"]);
      var to = _.buildNodes([]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('');

    });

  });

  describe("when using mixed nodes", function() {

    it("removes a key", function() {

      var from = _.buildNodes(["1", "#0", "#1", "#2"]);
      var to = _.buildNodes(["#0", "#1", "#2", "#3"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('#0#1#2#3');

    });

    it("moves a key for start to end", function() {

      var from = _.buildNodes(["a", "#0", "#1", "#2"]);
      var to = _.buildNodes(["#0", "#1", "#2", "a"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0#1#2a');

    });

    it("moves a key", function() {

      var from = _.buildNodes(["#0", "a", "#2", "#3"]);
      var to = _.buildNodes(["#0", "#1", "a", "#3"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0#1a#3');

    });

    it("moves a key with a size up", function() {

      var from = _.buildNodes(["a", "#1", "#2", "#3"]);
      var to = _.buildNodes(["#0", "#1", "#2", "#3", "a", "#5"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0#1#2#3a#5');

    });

    it("moves a key with a size down", function() {

      var from = _.buildNodes(["a", "#1", "#2", "#3"]);
      var to = _.buildNodes(["#0", "a", "#2"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0a#2');

    });

    it("avoids unnecessary reordering", function() {

      var from = _.buildNodes(["#0", "a", "#2"]);
      var to = _.buildNodes(["#0", "a", "#2"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0a#2');

    });

    it("adds and deletes and reorders", function() {

      var from = _.buildNodes(["a", "#1", "b", "#3", "c", "d", "#6"]);
      var to = _.buildNodes(["#0", "e", "d", "c", "#4", "a"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('#0edc#4a');

    });

  });

  describe("when using keyed nodes", function() {

    it("supports zero number", function () {

      var from = _.buildNodes([0, 1, 2, 3, 4]);
      var to = _.buildNodes([1, 2, 3, 4, 0]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('12340');

    });

    it("gets keys reordered", function () {

      var from = _.buildNodes(["1", "2", "3", "4", "test", "6", "good", "7"]);
      var to = _.buildNodes(["7", "4", "3", "2", "6", "test", "good", "1"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('74326testgood1');

    });

    it("removes one key at the start", function() {

      var from = _.buildNodes(["a", "b", "c"]);
      var to = _.buildNodes(["b", "c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('bc');

    });

    it("removes two keys at the start", function() {

      var from = _.buildNodes(["a", "b", "c"]);
      var to = _.buildNodes(["c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('c');

    });

    it("adds one key to start", function() {

      var from = _.buildNodes(["b", "c"]);
      var to = _.buildNodes(["a", "b", "c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('abc');

    });

    it("adds two key to start", function() {

      var from = _.buildNodes(["c"]);
      var to = _.buildNodes(["a", "b", "c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('abc');

    });

    it("removes one key at the end", function() {

      var from = _.buildNodes(["a", "b", "c"]);
      var to = _.buildNodes(["a", "b"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('ab');

    });

    it("removes two keys at the end", function() {

      var from = _.buildNodes(["a", "b", "c"]);
      var to = _.buildNodes(["a"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('a');

    });

    it("adds one key at the end", function() {

      var from = _.buildNodes(["a", "b"]);
      var to = _.buildNodes(["a", "b", "c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('abc');

    });

    it("adds two key at the end", function() {

      var from = _.buildNodes(["a"]);
      var to = _.buildNodes(["a", "b", "c"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('abc');

    });

    it("adds to end and deletes from center & reverses", function() {

      var from = _.buildNodes(["a", "b", "c", "d"]);
      var to = _.buildNodes(["e", "d", "c", "a"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('edca');

    });

    it("adds to front and removes", function() {

      var from = _.buildNodes(["c", "d"]);
      var to = _.buildNodes(["a", "b", "c", "e"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);

      expect(newRoot.textContent).toBe('abce');

    });

    it("clears all nodes", function() {

      var from = _.buildNodes(["a", "b", "c", "e"]);
      var to = _.buildNodes([]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('');

    });

    it("keeps a central pivot", function() {

      var from = _.buildNodes(["1", "2", "3"]);
      var to = _.buildNodes(["4", "2", "5"]);

      var rootNode = from.render();
      var childNodes = _.rewrap(rootNode.childNodes);

      var newRoot = patch.node(from, to);
      expect(newRoot, rootNode);

      expect(newRoot.textContent).toBe('425');

    });

  });

});
