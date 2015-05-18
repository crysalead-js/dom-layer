function applyDataset(element, previous, dataset) {
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

module.exports = applyDataset;
