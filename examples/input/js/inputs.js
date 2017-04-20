var Tree = domLayer.Tree;
var Tag = domLayer.Tag;
var Text = domLayer.Text;

domLayer.events.init();

/**
 * Returns the type of a DOM element.
 *
 * @param  Object element A DOM element.
 * @return String         The DOM element type.
 */
function elementType(element) {
  var name = element.nodeName.toLowerCase();
  if (name !== "input") {
    if (name === "select" && element.multiple) {
      return "select-multiple";
    }
    return name;
  }
  var type = element.getAttribute('type');
  if (!type) {
    return "text";
  }
  return type.toLowerCase();
}

/**
 * Gets DOM element value.
 *
 * @param  Object element A DOM element
 * @return mixed          The DOM element value
 */
function getValue(element) {
  var name = elementType(element);
  switch (name) {
    case "checkbox":
    case "radio":
      if (!element.checked) {
        return false;
      }
      var val = element.getAttribute('value');
      return val == null ? true : val;
    case "select":
    case "select-multiple":
      var options = element.options;
      var values = [];
      for (var i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          values.push(options[i].value);
        }
      }
      return name === "select-multiple" ? values : values[0];
    default:
      return element.value;
  }
}

function TextInput(value) {
  this._value = value;
}
TextInput.prototype.value = function() {
  return this._value;
}
TextInput.prototype.render = function() {
  return new Tag("input", {
    attrs: { type: "text", value: this._value},
    events: {
      oninput: function(e, node) {
        this._value = getValue(node.element);
        updateDom();
      }.bind(this)
    }
  });
}

function Textarea(value) {
  this._value = value;
}
Textarea.prototype.value = function() {
  return this._value;
}
Textarea.prototype.render = function() {
  return new Tag("textarea", {
    attrs: { value: this._value},
    events: {
      oninput: function(e, node) {
        this._value = getValue(node.element);
        updateDom();
      }.bind(this)
    }
  });
}

function CheckBox(value, checked) {
  this._value = value ? value : true;
  this._currentValue = checked ? this._value : false;
}
CheckBox.prototype.checked = function() {
  return this._currentValue === this._value;
}
CheckBox.prototype.value = function() {
  return this._currentValue;
}
CheckBox.prototype.render = function() {
  return new Tag("input", {
    props: { id: "checkbox", checked: this.checked() },
    attrs: { type: "checkbox", value: this._value},
    events: {
      onchange: function(e, node) {
        this._currentValue = getValue(node.element);
        updateDom();
      }.bind(this)
    }
  });
}

function RadioGroup(name, value) {
  this._name = name;
  this._value = value;
}

RadioGroup.prototype.name = function() {
  return this._name;
}

RadioGroup.prototype.value = function(value) {
  if (arguments.length) {
    this._value = value;
  }
  return this._value;
}

function Radio(group, value) {
  this._group = group;
  this._value = value;
}
Radio.prototype.checked = function() {
  return this._group.value() === this._value;
}
Radio.prototype.render = function() {
  return new Tag("input", {
    props: { checked: this.checked() },
    attrs: { type: "radio" , name: this._group.name(), value: this._value},
    events: {
      onchange: function(e, node) {
        this._group.value(getValue(node.element));
        updateDom();
      }.bind(this)
    }
  });
}

function Select(value, options) {
  this._value = value;
  this._options = options;
}
Select.prototype.value = function() {
  return this._value;
}
Select.prototype.render = function() {
  return new Tag("select", {
      attrs: { name: this._name, value: this._value},
      events: {
        onchange: function(e, node) {
          this._value = getValue(node.element);
          updateDom();
        }.bind(this)
      },
      callback: {
        created: function(node, element) {

        }
      }
    },
    this._options.map(function (i) {
      return new Tag("option", { attrs: { value: i[0] } } , [new Text(i[1])]);
    })
  );
}

function SelectMultiple(value, options) {
  this._value = value;
  this._options = options;
}
SelectMultiple.prototype.value = function() {
  return this._value;
}
SelectMultiple.prototype.render = function() {
  return new Tag("select", {
      attrs: { multiple: "multiple" , name: this._name, value: this._value},
      events: {
        onchange: function(e, node) {
          this._value = getValue(node.element);
          updateDom();
        }.bind(this)
      }
    },
    this._options.map(function (i) {
      return new Tag("option", { attrs: { value: i[0] } } , [new Text(i[1])]);
    })
  );
}

function InputRange(value) {
  this._value = value;
}
InputRange.prototype.value = function() {
  return this._value;
}
InputRange.prototype.render = function() {
  return new Tag("input", {
    attrs: { type: "range" , min: '0', max: '100', step: '10', value: this._value},
    events: {
      oninput: function(e, node) {
        this._value = getValue(node.element);
        updateDom();
      }.bind(this)
    }
  });
}