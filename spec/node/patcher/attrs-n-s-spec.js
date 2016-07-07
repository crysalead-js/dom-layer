var h = require('../../helper/h');
var _ = require('../../helper/util');
var patch = require('../../../src/tree/patch');
var attrsNS = require('../../../src/node/patcher/attrs-n-s');

var namespaces = attrsNS.namespaces;

describe("attrsNS", function() {

  describe(".patch()", function() {

    it("accepts empty value as previous attributes", function() {

      var element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      attrsNS.patch(element, undefined, { 'xlink:href': 'test.jpg' });

      expect(element.getAttributeNS(namespaces['xlink'], 'href')).toBe('test.jpg');

    });

    it("accepts empty value as previous attributes", function() {

      var element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      attrsNS.patch(element, undefined, { 'xlink:href': 'test.jpg' });

      expect(element.getAttributeNS(namespaces['xlink'], 'href')).toBe('test.jpg');

    });

    it("bails out when an attribute hasn't been modified", function() {

      var element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      attrsNS.patch(element, { 'xlink:href': 'test.jpg' }, { 'xlink:href': 'test.jpg' });

      expect(element.getAttributeNS(namespaces['xlink'], 'href')).toBe(null);

    });

    it("bails out when attributes are empty", function() {

      var element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      attrsNS.patch(element);
      expect(element).toBe(element);

    });

    it("sets namespaced attributes", function() {

      var from = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': 'test.jpg'
        }
      });

      var element = from.render();
      expect(element.getAttributeNS(namespaces['xlink'], 'href')).toBe('test.jpg');

    });

    it("unsets namespaced attributes", function() {

      var from = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': 'test.jpg'
        }
      });

      var to = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {}
      });

      var element = from.render();
      from.patch(to);
      expect(element.hasAttributeNS(namespaces['xlink'], 'href')).toBe(false);

    });

    it("unsets empty string `value` attributes", function() {

      var from = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': 'test.jpg'
        }
      });

      var to = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': ''
        }
      });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttributeNS(namespaces['xlink'], 'href')).toBe(false);

    });

    it("unsets `false` `value` attributes", function() {

      var from = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': 'test.jpg'
        }
      });

      var to = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': false
        }
      });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttributeNS(namespaces['xlink'], 'href')).toBe(false);

    });

    it("unsets `null` `value` attributes", function() {

      var from = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': 'test.jpg'
        }
      });

      var to = h({
        tagName: 'image',
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        attrsNS: {
          'xlink:href': null
        }
      });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttributeNS(namespaces['xlink'], 'href')).toBe(false);

    });

  });

});
