var isArray = Array.isArray;

function create(container, nodes, parent) {
  if (typeof nodes === "function") {
    nodes = nodes(container, parent);
  }
  if (nodes == null) {
    return;
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      container.appendChild(nodes[i].render(parent));
    }
  }
  return nodes;
}

module.exports = create;