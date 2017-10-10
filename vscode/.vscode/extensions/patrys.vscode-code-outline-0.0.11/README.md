# Code Outline tree provider for Visual Studio Code

## Features

Displays a code outline tree in the explorer pane.

To activate find and expand the "Code Outline" section near the bottom of the Explorer tab.

## Requirements

The necessary APIs are only available in VSCode version 1.13 and up.

## Extension Settings

Default settings:

```json
{
  "symbolOutline.doSort": true,
  "symbolOutline.doSelect": true,
  "symbolOutline.sortOrder": [
    "Class",
    "Module",
    "Constant",
    "Interface",
    "*",
    "Constructor",
    "Function",
    "Method"
  ],
  "symbolOutline.expandNodes": [
    "Module",
    "Class",
    "Interface",
    "Namespace",
    "Object",
    "Package",
    "Struct"
  ],
  "symbolOutline.topLevel": [
    "*"
  ]
}
```

- **doSort:** sort the outline.
- **doSelect:** select the code segment by selecting item.
- **expandNodes:** kinds of nodes to be expanded automatically.
- **sortOrder:** order to the sort symbols.
- **topLevel:** wich symbols include at the topmost scope.

## Known Issues

Depending on other extensions you have installed the symbol list may initially return an empty list. Use the "Refresh" button next to the title to fix this.
