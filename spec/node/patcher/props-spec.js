var domElementValue = require("dom-element-value");
var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../src/tree/patch");
var props = require("../../../src/node/patcher/props");

describe("props", function() {

  describe(".patch()", function() {

    it("sets an property", function() {

      var from = h();
      var to = h({ props: { className: 'active' } });

      var element = from.render();
      from.patch(to);

      expect(element.className).toBe('active');

    });

    it("sets the `name` property", function() {

      var node = h({ tagName: 'input', attrs: { name: 'input1' } });
      var element = node.render();
      expect(element.name).toBe('input1');

    });

    it("sets the `className` property", function() {

      var from = h();
      var to = h({ tagName: 'div', props: { className: 'active' } });

      var element = from.render();
      from.patch(to);

      expect(element.className).toBe('active');

    });

    it("sets an `className` property using `null`", function() {

      var from = h();
      var to = h({ tagName: 'div', props: { className: null } });

      var element = from.render();
      from.patch(to);

      expect(element.className).toBe('');

    });

    it("sets the `className` property using an object", function() {

      var from = h();
      var to = h({ tagName: 'div', props: { className: {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var element = from.render();
      from.patch(to);

      expect(element.classList.contains('active1')).toBe(true);
      expect(element.classList.contains('inactive')).toBe(false);
      expect(element.classList.contains('active2')).toBe(true);

    });

    it("sets the `dataset` property", function() {

      var a = h({ tagName: 'div', props: { dataset: { foo: 'bar', bar: 'oops' } } });
      var element = a.render();

      expect(element.dataset.foo).toBe('bar');
      expect(element.dataset.bar).toBe('oops');

    });

    it("ignores `dataset` if `null`", function() {

      var from = h({ tagName: 'div', props: { dataset: null } });
      var element = from.render();

      var defined = 0;
      for (var key in element.dataset) {
        defined++;
      }
      expect(defined).toBe(0);

    });

    it("ignores `undefined` property", function() {

      var node = h({ tagName: 'div', props: { special: undefined } });
      var element = node.render();
      expect('special' in element).toBe(false);

    });

    it("ignores `undefined` value property", function() {

      var node = h({ tagName: 'div', props: { value: undefined } });
      var element = node.render();
      expect('value' in element).toBe(false);

    });

    it("patches a property", function() {

      var from = h({ props: { title: 'hello' } });
      var to = h({ props: { title: 'world' } });
      var element = from.render();
      expect(element.title).toBe('hello');

      from.patch(to);
      expect(element.title).toBe('world');

    });

    it("patches the `className` property", function() {

      var from = h({ props: { className: 'hello' } });
      var to = h({ props: { className: 'world' } });
      var element = from.render();
      expect(element.className).toBe('hello');

      from.patch(to);
      expect(element.className).toBe('world');

    });

    it("patches the `className` property from a string to object", function() {

      var from = h({ tagName: 'div', props: { className: 'default-class' } });
      var to = h({ tagName: 'div', props: { className: {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var element = from.render();
      expect(element.className).toBe('default-class');

      from.patch(to);

      expect(element.classList.contains('active1')).toBe(true);
      expect(element.classList.contains('inactive')).toBe(false);
      expect(element.classList.contains('active2')).toBe(true);

    });

    it("patches the `className` property using objects", function() {

      var from = h({ tagName: 'div', props: { className: {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var to = h({ tagName: 'div', props: { className: {
        active1: false,
        inactive: true,
        active2: false
      } } });

      var element = from.render();
      expect(element.classList.contains('active1')).toBe(true);
      expect(element.classList.contains('inactive')).toBe(false);
      expect(element.classList.contains('active2')).toBe(true);

      from.patch(to);

      expect(element.classList.contains('active1')).toBe(false);
      expect(element.classList.contains('inactive')).toBe(true);
      expect(element.classList.contains('active2')).toBe(false);

    });

    it("patches the `className` property from object to string", function() {

      var from = h({ tagName: 'div', props: { className: {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var to = h({ tagName: 'div', props: { className: 'default-class' } });

      var element = from.render();
      expect(element.classList.contains('active1')).toBe(true);
      expect(element.classList.contains('inactive')).toBe(false);
      expect(element.classList.contains('active2')).toBe(true);

      from.patch(to);

      expect(element.className).toBe('default-class');

    });

    it("patches the `dataset` property", function() {

      var from = h({ props: { dataset: { foo: 'bar', bar: 'oops' } } });
      var to = h({ props: { dataset: { foo: 'baz', bar: 'oops' } } });
      var element = from.render();
      expect(element.dataset.foo).toBe('bar');
      expect(element.dataset.bar).toBe('oops');

      from.patch(to);
      expect(element.dataset.foo).toBe('baz');
      expect(element.dataset.bar).toBe('oops');

    });

    it("ignores empty `value` property", function() {

      var select = h({ tagName: 'select', props: { value: null } }, [
        h({tagName: 'option', props: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', props: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element)).toBe('foo');

    });

    it("populates the `value` property on select", function() {

      var select = h({ tagName: 'select', props: { value: 'bar' } }, [
        h({tagName: 'option', props: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', props: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element)).toBe('bar');

    });

    it("populates the `value` property on select multiple", function() {

      var select = h({ tagName: 'select', props: { multiple: true, value: ['foo', 'bar'] } }, [
        h({tagName: 'option', props: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', props: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(['bar', 'foo']);

    });

    it("populates the `value` property on select multiple using groups", function() {

      var select = h({ tagName: 'select', props: { multiple: true, value: ['foo', 'bar'] } }, [
        h({tagName: 'optgroup', attrs: {label: 'foo-group'}}, [
          h({tagName: 'option', props: {value: 'foo'}}, ['foo'])
        ]),
        h({tagName: 'optgroup', attrs: {label: 'bar-group'}}, [
          h({tagName: 'option', props: {value: 'bar'}}, ['bar'])
        ])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(['bar', 'foo']);

    });

    it("keeps `value` unchanged when `type` is modified", function() {

      var from = h({ tagName: 'input', props: { type: 'text', value: 'hello' } });
      var to = h({ tagName: 'input', props: { type: 'checkbox', value: 'hello' } });

      var element = from.render();
      expect(element.type).toBe('text');
      expect(element.value).toBe('hello');

      from.patch(to);

      expect(element.hasAttribute('value')).toBe(true);
      expect(element.type).toBe('checkbox');
      expect(element.value).toBe('hello');

    });

    it("bails out when properties are empty", function() {

      var element = document.createElement('div');
      props.patch(element);
      expect(element).toBe(element);

    });

    it("unsets a property", function() {

      var from = h({ tagName: 'div', props: { onclick: function() {} }});
      var element = from.render();
      expect(typeof element.onclick).toBe('function');

      var to = h({ tagName: 'div', props: {}});
      from.patch(to);
      expect(element.onclick).toBe(null);

    });

    it("unsets the `className` property", function() {

      var from = h({ props: { className: 'hello' } });
      var to = h();
      var element = from.render();
      expect(element.className).toBe('hello');

      from.patch(to);
      expect(element.className).toBe('');

    });

    it("unsets a property when equal to `undefined`", function() {

      var from = h({ tagName: 'div', props: { onclick: function() {} } });
      var element = from.render();
      expect(typeof element.onclick).toBe('function');

      var to = h({ tagName: 'div', props: { onclick: undefined } });
      from.patch(to);
      expect(element.onclick).toBe(null);

    });

    it("unsets `dataset` property", function() {

      var from = h({ tagName: 'div', props: { dataset: { foo: 'bar', bar: 'oops' } } });
      var element = from.render();

      var to = h({ tagName: 'div', props: { dataset: { foo: 'bar', baz: 'hello' } } });
      from.patch(to);

      expect(element.dataset.foo).toBe('bar');
      expect(element.dataset.bar).toBe(undefined);
      expect(element.dataset.baz).toBe('hello');

    });

    it("unsets `dataset` properties", function() {

      var from = h({ tagName: 'div', props: { dataset: { foo: 'bar', bar: 'oops' } } });
      var element = from.render();

      expect(element.dataset.foo).toBe('bar');
      expect(element.dataset.bar).toBe('oops');

      to = h({ tagName: 'div', props: {  } });
      from.patch(to);

      expect(element.dataset.foo).toBe(undefined);
      expect(element.dataset.bar).toBe(undefined);

    });

    it("unsets `dataset` properties using `null`", function() {

      var from = h({ tagName: 'div', props: { dataset: { foo: 'bar', bar: 'oops' } } });
      var element = from.render();

      var to = h({ tagName: 'div', props: { dataset: null } });
      from.patch(to);

      expect(element.dataset.foo).toBe(undefined);
      expect(element.dataset.bar).toBe(undefined);

    });

  });

});
