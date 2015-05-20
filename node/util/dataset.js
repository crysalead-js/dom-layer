/**
 * Maintains state of element dataset.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of dataset.
 * @param  Object dataset   The dataset to match on.
 * @return Object dataset   The element dataset state.
 */
function patch(element, previous, dataset) {
  if (!previous && !dataset) {
    return dataset;
  }
  var name;
  previous = previous || {};
  dataset = dataset || {};

  for (name in previous) {
    if (dataset[name] === undefined) {
      element.dataset[name] = undefined;
    }
  }

  for (name in dataset) {
    if (previous[name] === dataset[name]) {
      continue;
    }
    element.dataset[name] = dataset[name];
  }

  return dataset;
}

module.exports = {
  patch: patch
};
