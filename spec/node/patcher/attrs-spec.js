var domElementValue = require('dom-element-value');
var h = require('../../helper/h');
var _ = require('../../helper/util');
var patch = require('../../../src/tree/patch');
var attrs = require('../../../src/node/patcher/attrs');

describe("attrs", function() {

  describe(".patch()", function() {

    it("sets an attributes", function() {

      var from = h({ attrs: { src: 'test.jpg' } });
      var element = from.render();

      expect(element.getAttribute('src')).toBe('test.jpg');

    });

    it("sets the `name` attributes", function() {

      var node = h({ tagName: 'input', attrs: { name: 'input1' } });
      var element = node.render();

      expect(element.getAttribute('name')).toBe('input1');

    });

    it("sets an event attribute as a string", function() {

      var node = h({ tagName: 'input', attrs: { onclick: 'function(){}' } });
      var element = node.render();

      expect(element.getAttribute('onclick')).toBe('function(){}');

    });

    it("sets an event attribute as a function", function() {

      var fct = function(){};
      var node = h({ tagName: 'input', attrs: { onclick: fct } });
      var element = node.render();

      expect(element.onclick).toBe(fct);

    });

    it("sets the `style` attribute using `null`", function() {

      var from = h({ tagName: 'div', attrs: { style: null } });
      var element = from.render();

      expect(element.style.cssText).toBe('');

    });

    it("sets the `style` attribute", function() {

      var from = h({ tagName: 'div', attrs: { style: 'display: none' } });
      var element = from.render();

      expect(element.style.display).toBe(_.style('display', 'none'));

    });

    it("sets the `style` attribute using an object", function() {

      var from = h({ tagName: 'div', attrs: { style: { display: 'none' } } });
      var element = from.render();

      expect(element.style.display).toBe(_.style('display', 'none'));

    });

    it("patches an attribute", function() {

      var from = h({ attrs: { foo: 'bar', bar: 'oops' } });
      var to = h({ attrs: { foo: 'baz', bar: 'oops' } });
      var element = from.render();
      expect(element.getAttribute('foo')).toBe('bar');
      expect(element.getAttribute('bar')).toBe('oops');

      from.patch(to);
      expect(element.getAttribute('foo')).toBe('baz');
      expect(element.getAttribute('bar')).toBe('oops');

    });

    it("patches an event attribute as a string", function() {

      var from = h({ attrs: { onclick: 'function(){}' } });
      var to = h({ attrs: { onclick: 'return "Hello World"' } });
      var element = from.render();
      expect(element.getAttribute('onclick')).toBe('function(){}');

      from.patch(to);
      expect(element.getAttribute('onclick')).toBe('return "Hello World"');

    });

    it("patches an event attribute as a function", function() {

      var fct1 = function(){ return 'Hello'; };
      var from = h({ attrs: { onclick: fct1 } });
      var element = from.render();
      expect(element.onclick).toBe(fct1);

      var fct2 = function(){ return 'Hello World'; };
      var to = h({ attrs: { onclick: fct2 } });
      from.patch(to);
      expect(element.onclick).toBe(fct2);

    });

    it("patches an event attribute as a string to an event attribute as a function", function() {

      var from = h({ attrs: { onclick: 'return "Hello World"' } });
      var element = from.render();
      expect(element.onclick()).toBe('Hello World');
      expect(element.getAttribute('onclick')).toBe('return "Hello World"');

      var fct = function(){ return 'Hello'; };
      var to = h({ attrs: { onclick: fct } });
      from.patch(to);
      expect(element.getAttribute('onclick')).toBe(null);
      expect(element.onclick).toBe(fct);

    });

    it("patches an event attribute as a function to an event attribute as a string", function() {

      var fct = function(){ return 'Hello'; };
      var from = h({ attrs: { onclick: fct } });
      var element = from.render();
      expect(element.onclick).toBe(fct);

      var to = h({ attrs: { onclick: 'return "Hello World"' } });
      from.patch(to);
      expect(element.onclick()).toBe('Hello World');
      expect(element.getAttribute('onclick')).toBe('return "Hello World"');

    });

    it("patches the `class` attributes from an empty value", function() {

      var from = h();
      var to = h({ tagName: 'div', attrs: { 'class': 'active' } });

      var element = from.render();
      from.patch(to);

      expect(element.className).toBe('active');

    });

    it("patches the `class` attribute from a string to object", function() {

      var from = h({ tagName: 'div', attrs: { 'class': 'default-class' } });

      var to = h({ tagName: 'div', attrs: { 'class': {
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

    it("patches the `class` attribute using objects", function() {

      var from = h({ tagName: 'div', attrs: { 'class': {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var to = h({ tagName: 'div', attrs: { 'class': {
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

    it("patches the `class` attribute from object to string", function() {

      var from = h({ tagName: 'div', attrs: { 'class': {
        active1: true,
        inactive: false,
        active2: true
      } } });

      var to = h({ tagName: 'div', attrs: { 'class': 'default-class' } });

      var element = from.render();
      expect(element.classList.contains('active1')).toBe(true);
      expect(element.classList.contains('inactive')).toBe(false);
      expect(element.classList.contains('active2')).toBe(true);

      from.patch(to);

      expect(element.className).toBe('default-class');

    });

    it("patches the `style` attributes from an empty value object", function() {

      var from = h();
      var to = h({ tagName: 'div', attrs: { style: { display: 'none' } } });

      var element = from.render();
      from.patch(to);

      expect(element.style.display).toBe(_.style('display', 'none'));

    });

    it("patches the `style` attribute from string to object", function() {

      var from = h({ tagName: 'div', attrs: { style: 'width: 10px' } });
      var to = h({ tagName: 'div', attrs: { style: { padding: '5px' } } });

      var element = from.render();
      expect(element.style.width).toBe(_.style('width', '10px'));

      from.patch(to);

      expect(element.style.padding).toBe(_.style('padding', '5px'));
      expect(element.style.width).toBe(_.style('width', ''));

    });

    it("patches the `style` attribute using objects", function() {

      var from = h({ tagName: 'div', attrs: { style: { width: '10px', margin: '10px' } } });
      var to = h({ tagName: 'div', attrs: { style: { padding: '5px', margin: '15px' } } });

      var element = from.render();
      expect(element.style.width).toBe(_.style('width', '10px'));
      expect(element.style.margin).toBe(_.style('margin', '10px'));

      from.patch(to);

      expect(element.style.padding).toBe(_.style('padding', '5px'));
      expect(element.style.margin).toBe(_.style('margin', '15px'));
      expect(element.style.width).toBe(_.style('width', ''));

    });

    it("patches the `style` attribute from object to string", function() {

      var from = h({ tagName: 'div', attrs: { style: { width: '10px' } } });
      var to = h({ tagName: 'div', attrs: { style: 'padding: 5px' } });

      var element = from.render();
      expect(element.style.width).toBe(_.style('width', '10px'));

      from.patch(to);

      expect(element.style.padding).toBe(_.style('padding', '5px'));
      expect(element.style.width).toBe(_.style('width', ''));

    });

    it("ignores `undefined` attribute", function() {

      var node = h({ tagName: 'div', attrs: { 'class': undefined } });
      var element = node.render();
      expect(element.hasAttribute('class')).toBe(false);

    });

    it("ignores `undefined` value attribute", function() {

      var node = h({ tagName: 'div', attrs: { value: undefined } });
      var element = node.render();
      expect('value' in element).toBe(false);
      expect(element.hasAttribute('value')).toBe(false);

    });

    it("ignores empty `value` attribute", function() {

      var select = h({ tagName: 'select', attrs: { value: null } }, [
        h({tagName: 'option', attrs: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', attrs: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element)).toBe('foo');

    });

    it("populates the `value` attribute on select", function() {

      var select = h({ tagName: 'select', attrs: { value: 'bar' } }, [
        h({tagName: 'option', attrs: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', attrs: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element)).toBe('bar');

    });

    it("populates the `value` attribute on select multiple", function() {

      var select = h({ tagName: 'select', attrs: { multiple: 'multiple', value: ['foo', 'bar'] } }, [
        h({tagName: 'option', attrs: {value: 'foo'}}, ['foo']),
        h({tagName: 'option', attrs: {value: 'bar'}}, ['bar'])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(['bar', 'foo']);

    });

    it("populates the `value` attribute on select multiple using groups", function() {

      var select = h({ tagName: 'select', attrs: { multiple: 'multiple', value: ['foo', 'bar'] } }, [
        h({tagName: 'optgroup', attrs: {label: 'foo-group'}}, [
          h({tagName: 'option', attrs: {value: 'foo'}}, ['foo'])
        ]),
        h({tagName: 'optgroup', attrs: {label: 'bar-group'}}, [
          h({tagName: 'option', attrs: {value: 'bar'}}, ['bar'])
        ])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(['bar', 'foo']);

    });

    it("assures the `value` attribute also set the value property for `textarea`", function() {

      var select = h({ tagName: 'textarea', attrs: { value: 'bar' } });

      var element = select.render();
      expect(element.value).toBe('bar');

    });

    it("assures the `value` attribute to NOT set the checked property for `radio`", function() {

      var select = h({ tagName: 'input', attrs: { type: 'radio', name: 'a', value: 'bar' } });

      var element = select.render();
      expect(element.checked).toBe(false);

    });

    it("assures the `value` attribute to NOT set the checked property for `checkbox`", function() {

      var select = h({ tagName: 'input', attrs: { type: 'checkbox', value: 'bar' } });

      var element = select.render();
      expect(element.checked).toBe(false);

    });

    it("sets empty string `value` attributes", function() {

      var from = h({ tagName: 'input', attrs: { value: 'hello' } });
      var to = h({ tagName: 'input', attrs: { value: '' } });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttribute('value')).toBe(true);
      expect(element['value']).toBe('');

    });

    it("casts `false` `value` attributes as an empty string", function() {

      var from = h({ tagName: 'input', attrs: { value: 'hello' } });
      var to = h({ tagName: 'input', attrs: { value: false } });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttribute('value')).toBe(true);
      expect(element['value']).toBe('');

    });

    it("unsets `null` `value` attributes", function() {

      var from = h({ tagName: 'input', attrs: { value: 'hello' } });
      var to = h({ tagName: 'input', attrs: { value: null } });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttribute('value')).toBe(false);
      expect(element['value']).toBe('');

    });

    it("keeps `value` unchanged when `type` is modified", function() {

      var from = h({ tagName: 'input', attrs: { type: 'text', value: 'hello' } });
      var to = h({ tagName: 'input', attrs: { type: 'checkbox', value: 'hello' } });

      var element = from.render();
      expect(element.type).toBe('text');
      expect(element.value).toBe('hello');

      from.patch(to);

      expect(element.hasAttribute('value')).toBe(true);
      expect(element.type).toBe('checkbox');
      expect(element.value).toBe('hello');

    });

    it("keeps empty `value` when `type` is modified", function() {

      var from = h({ tagName: 'input', attrs: {} });
      var to = h({ tagName: 'input', attrs: { type: 'radio' } });

      var element = from.render();
      from.patch(to);

      expect(element.getAttribute('value')).toBe(null);
      expect(element.type).toBe('radio');

    });

    it("bails out when `type` is not modified", function() {

      var from = h({ tagName: 'input', attrs: { type: 'text', value: 'hello' } });
      var to = h({ tagName: 'input', attrs: { type: 'text', value: 'hello' } });

      var element = from.render();
      expect(element.type).toBe('text');
      expect(element.value).toBe('hello');

      from.patch(to);

      expect(element.hasAttribute('value')).toBe(true);
      expect(element.type).toBe('text');
      expect(element.value).toBe('hello');

    });

    it("bails out when attributes are empty", function() {

      var element = document.createElement('div');
      attrs.patch(element);
      expect(element).toBe(element);

    });

    it("unsets an attribute", function() {

      var from = h({ attrs: { a: '1', b: '2', c: '3' } });
      var to = h({ attrs: { a: '1', c: '3' } });

      var element = from.render();
      from.patch(to);

      expect(element.getAttribute('a')).toBe('1');
      expect(element.getAttribute('b')).toBe(null);
      expect(element.getAttribute('c')).toBe('3');

    });

    it("unsets event attributes as string", function() {

      var from = h({ attrs: { onclick: 'return "Hello World"' } });
      var to = h({ attrs: { } });

      var element = from.render();
      from.patch(to);

      expect(element.getAttribute('onclick')).toBe(null);
      expect(element.onclick).toBe(null);

    });

    it("unsets event attributes as function", function() {

      var fct = function() { return 'Hello'; };
      var from = h({ attrs: { onclick: fct } });
      var to = h({ attrs: { } });

      var element = from.render();
      from.patch(to);

      expect(element.getAttribute('onclick')).toBe(null);
      expect(element.onclick).toBe(null);

    });

    it("unsets all attributes", function() {

      var from = h({ attrs: { a: '1', b: '2', c: '3' } });
      var to = h();

      var element = from.render();
      from.patch(to);

      expect(element.getAttribute('a')).toBe(null);
      expect(element.getAttribute('b')).toBe(null);
      expect(element.getAttribute('c')).toBe(null);

    });

    it("unsets an attribute when equal to `undefined`", function() {

      var from = h({ attrs: { style: { display: 'none', width: '10px' } } });

      var to = h({ attrs: { style: undefined } });

      var element = from.render();
      from.patch(to);

      expect(element.style.display).toBe(_.style('display', ''));
      expect(element.style.width).toBe(_.style('width', ''));

    });

    it("unsets an attribute when equal to `null`", function() {

      var from = h({ tagName: 'input', attrs: { custom: 'hello' } });
      var to = h({ tagName: 'input', attrs: { custom: null } });

      var element = from.render();
      from.patch(to);

      expect(element.hasAttribute('custom')).toBe(false);
      expect(element.custom).toBe(undefined);

    });

  });

});
