var isArray = Array.isArray;

function render(container, nodes, parent) {
  if (typeof nodes === 'function') {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      nodes[i].render(container, parent);
    }
  }
  return nodes;
}

module.exports = render;
