# Change Log

## HEAD

## 0.2.1 (2015-06-13)
  * **Add:** renders the `innerHTML` property if present and no children has been defined through `toHtml()`.

## 0.2.0 (2015-06-03)

  * **Bugfix:** fixes minor bug related to dataset update.
  * **BC break:** repository refactoring some internal path may have changed.

## 0.1.9 (2015-05-30)

  * **Add:** adds an `"updated"` callback to `Tag`.

## 0.1.8 (2015-05-30)

  * **Add:** the mount identifier can be now choosed on mounting using any kind of UUID.
  * **Add:** allows to define the class name(s) property/attribute using an object.
  * **Bugfix:** sets namespace & type extension of `Tag` to `null` instead fo `""` by default.
  * **Bugfix:** fixes html rendering of namespaced attributes.

## 0.1.7 (2015-05-27)

  * **Bugfix:** fixes the new patching algorithm.

## 0.1.6 (2015-05-27)

  * **Add:** supports type extension (for custom elements).
  * **Add:** refactors the patching algorithm for better performances on updates.
  * **Add:** auto unmounts already mounted virtual trees on `mount()`.
  * **Bugfix:** filters out the value attribute of textarea, select & contenteditable element from rendering.
  * **Bugfix:** fixes inline style rendering when using `toHtml()`.
  * **BC break:** extracts namespace right from the xmlns attribute.

## 0.1.5 (2015-05-25)

  * **Update:** updates dependencies.

## 0.1.4 (2015-05-25)

  * **Add:** starts considering server side rendering using `attach()`.
  * **BC break:** repo refactoring some internal paths may have changed.

## 0.1.3 (2015-05-23)

  * **Bugfix:** fixes focus lost issue on input.

## 0.1.2 (2015-05-23)

  * **Add:** adds the input example.
  * **Bugfix:** fixes an issue with checkbox & radio input.
  * **Bugfix:** fixes the `getManager()` exposed method.
  * **BC break:** reformat custom set/unset handlers, they must now be populated under the `handlers` namespace.
  * **BC break:** `unmount()` takes now a mount id as first parameter.

## 0.1.1 (2015-05-22)

  * **Add:** adds the event delegation system.
  * **Bugfix:** `domLayerNode` is now correcly updated when some event handlers are set through `events`.

## 0.1.0 (2015-05-20)

  * **BC break:** refactor properties/attributes API to allow custom handlers.
  * **BC break:** `mount()` && `unmount()` can now only be done on a single DOM element.

## 0.0.10 (2015-05-18)

  * **Add:** force rerendering when the type of nodes are different.
  * **Bugfix:** dataset properties wasn't setted correctly.

## 0.0.9 (2015-05-16)

  * **Bugfix:** rendering properties and attributes were applied before children rendering.

## 0.0.8 (2015-05-15)

  * **Bugfix:** fixes the release according to the source.

## 0.0.7 (2015-05-15)

  * **Bugfix:** parent namespace need to be propagated to children in SVG.

## 0.0.6 (2015-05-14)

  * **Bugfix:** fixes a couple of bugs and remove some deprecated parameters.

## 0.0.5 (2015-05-11)

  * **Add:** updates the README & fixes CHANGELOG.

## 0.0.4 (2015-05-10)

  * **Add:** adds the examples/speedtest example.
  * **BC break:** some repo refactoring.
  * **BC break:** the Layer has been renamed to Tree.

## 0.0.3 (2015-05-09)

  * **Add:** makes the SVG support more generic.

## 0.0.2 (2015-05-08)

  * **Bugfix:** ignores updates with invalid id.
  * **BC break:** removes the forwared feature.

## 0.0.1 (2015-05-08)

  * **Add:** adds some specs for mount/unmount operations.
  * **Bugfix:** fixes package.json dependencies

## 0.0.0 (2015-05-07)

  * Initial release.
