# Change Log

## 0.0.12

- Implement a much faster tree building algorithm ([issue #55](https://github.com/patrys/vscode-code-outline/issues/55))

## 0.0.11

- Use location ranges to determine symbol containment

## 0.0.10

- Expand namespaces, packages, classes and structures by default (can be configured in settings)
- Default to no sorting (can still be enabled in settings)

## 0.0.9

- Improved scrolling and correct handling for split editing

## 0.0.8

- Sorting is now configurable and you can filter top-level symbols ([#28 by @sceutre](https://github.com/patrys/vscode-code-outline/pull/28))
- Ad-hoc containers like unnamed scopes are no longer ignored ([#27 by @jacobdufault](https://github.com/patrys/vscode-code-outline/pull/27))

## 0.0.7

- Clear the tree when editor is closed
- Fix `Cannot read property 'children' of undefined` error

## 0.0.6

- Fix some icons being raster bitmaps

## 0.0.5

- Refresh the outline when the document is saved or reloaded from disk

## 0.0.4

- Better icon consistency with VSCode
- Support for light themes

## 0.0.3

- Added a refresh button

## 0.0.2

- Clicking items activates the editor

## 0.0.1

- Initial release
