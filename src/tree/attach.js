var isArray = Array.isArray;

function attach(container, nodes, parent) {
  if (typeof nodes === 'function') {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }

  var i = 0, j = 0;
  var childNodes = container.childNodes;
  var nodesLen = nodes.length
  var text, textLen, size;

  while (i < nodesLen) {
    if (!nodes[i]) {
      i++;
      continue;
    }
    if (nodes[i].type !== 'Text') {
      nodes[i].attach(childNodes[j], parent);
      i++;
    } else {
      // In an HTML template having consecutive textual nodes is not possible.
      // So the virtual tree will be dynamically adjusted to make attachments to
      // work out of the box in a transparent manner if this principle is not
      // respected in a virtual tree.

      size = nodes[i].data.length;
      text = childNodes[j].data;

      nodes[i].data = text;
      nodes[i].attach(childNodes[j], parent);
      i++;

      textLen = text.length;
      while (size < textLen && i < nodesLen) {
        size += nodes[i].data.length;
        nodes[i].data = '';
        i++;
      }
    }
    j++;
  }
  return nodes;
}

module.exports = attach;
