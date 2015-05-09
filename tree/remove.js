
function remove(nodes, parent) {
  for (var i = 0, len = nodes.length; i < len; i++) {
    nodes[i].remove();
  }
}

module.exports = remove;