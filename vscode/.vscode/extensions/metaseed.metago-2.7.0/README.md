
[![Version](https://vsmarketplacebadge.apphb.com/version/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Dependencies Status](https://david-dm.org/metaseed/metago/status.svg)](https://david-dm.org/metaseed/metago)
[![DevDependencies Status](https://david-dm.org/metaseed/metago/dev-status.svg)](https://david-dm.org/metaseed/metago?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/metaseed/metago/badge.svg)](https://snyk.io/test/github/metaseed/metago)
[![bitHound Overall Score](https://www.bithound.io/github/metaseed/metago/badges/score.svg)](https://www.bithound.io/github/metaseed/metago)
[![bitHound Dependencies](https://www.bithound.io/github/metaseed/metago/badges/dependencies.svg)](https://www.bithound.io/github/metaseed/metago/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/metaseed/metago/badges/devDependencies.svg)](https://www.bithound.io/github/metaseed/metago/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/metaseed/metago/badges/code.svg)](https://www.bithound.io/github/metaseed/metago)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/metaseed/metago.svg)](https://isitmaintained.com/project/metaseed/metago "Average time to resolve an issue")
[![Percentage of issues still open](https://isitmaintained.com/badge/open/metaseed/metago.svg)](https://isitmaintained.com/project/metaseed/metago "Percentage of issues still open")

## Features
MetaGo provides fast cursor movement/selection for keyboard focused users:
* go to any character on screen with 3(most cases) or 4 times key press.
* using bookmarks to jump between files.
* moving cursor up/down between blank lines.
* select code block when moving cursor while hold shift key.
* scroll the active line (contains cursor) to the screen Top/Middle/Bottom.
* select line up/down.
* compatible with the vim plugins. :smile:

### go to any character on screen
1. type <kbd>Alt</kbd>+<kbd>;</kbd> to tell I want to *go* somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *go* to that location. 

> at any time press <kbd>ESC</kbd> to cancel


> the <kbd>Alt</kbd>+<kbd>;</kbd> command will trigger the metaGo.goto command, the cursor will be placed after the target character; 
metaGo.gotoBefore and metaGo.inteli commands are also provided.
metaGo.inteli intelligently set cursor position after navigation:
> if the target is at the begin of the word, the cursor will be set before target character, otherwise after it;
> The 'word' is defined as a group of all alphanumeric or punctuation characters. 
> MetaGo also provide commands that set cursor before/after the character after navigation, you can config the shortcut by yourself.

> * type <kbd>Alt</kbd>+<kbd>;</kbd> and then press <kbd>Enter</kbd> to directly go to the one above;
> * type <kbd>Alt</kbd>+<kbd>;</kbd> and then press <kbd>Space</kbd> to directly go to the one below;

### select to any character on screen from cursor
1. type <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>;</kbd> to tell I want to *select* to somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *select* to that location.
4. repeat 1-3 to adjust your current selection.
> at any time press <kbd>ESC</kbd> to cancel

![MetaGo.MetaJump](https://github.com/metaseed/metaGo/raw/master/images/metago.jump.gif)

### features highlight
* code characters are based on priority, the easier to type character has higher priority. i.e. 'k','j', and code characters are configurable, if you like.
* code character decorator is encoded with 1 or 2 characters, the code characters around cursor are easier to type.
* only encode characters on viewable screen area, so metaGo is faster.
* even though your cursor is out of your viewable screen, metaGo still works!
* work with vim plugin

### navigate between files using bookmarks

* <kbd>Alt</kbd>+ <kdb>\'</kbd> to set a bookmark at the cursor location.
* <kbd>Alt</kbd>+<kdb>\/</kbd> to list the bookmarks and show management menu.
    1. press <kdb>cc</kbd> and <kbd>enter</kbd> to clear all the bookmarks
    2. press <kdb>c</kbd> and <kbd>enter</kbd> to clear all the bookmarks in current document.
    3. press <kdb>n</kbd> and <kbd>enter</kbd> to jump to the next bookmark.
    4. press <kdb>p</kbd> and <kbd>enter</kbd> to jump to the previous bookmark.

![MetaGo.Center](https://github.com/metaseed/metaGo/raw/master/images/metago.bookmark.gif)

### scroll line to the screen center/top
* <kbd>Alt</kbd>+<kbd>m</kbd> is the default shortcut to scroll current line to screen center.
* <kbd>Alt</kbd>+<kbd>t</kbd> is the default shortcut to scroll current line to screen top.
* <kbd>Alt</kbd>+<kbd>b</kbd> is the default shortcut to scroll current line to screen bottom.

![MetaGo.Center](https://github.com/metaseed/metaGo/raw/master/images/metago.center.gif)

### moving cursor up/down between blank lines
* <kbd>Alt</kbd>+<kbd>Home</kbd>(default shortcut) to move cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>End</kbd>(default shortcut) to move cursor to the blank line below.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>Home</kbd>(default shortcut) to select from the cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>End</kbd>(default shortcut) to select from the cursor to the blank line below.
![MetaGo.blankLine](https://github.com/metaseed/metaGo/raw/master/images/metago.blankLine.gif)

### select line up/down
* <kbd>Ctrl</kbd>+<kbd>i</kbd> to select line up.
* <kbd>Ctrl</kbd>+<kbd>shift</kbd>+i to select line down.

### jump to bracket
* extend the default jumpToBracket command.
* <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>\</kbd>jump to the begin bracket that contains the cursor. Press the shortcut again jump to the end bracket.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Default Shortcut Settings

            { 
                "command": "metaGo.input.cancel",
                "key": "escape",
                "when": "editorTextFocus && metaGoInput"
            },
            {
                "command": "metaGo.goto",
                "key": "alt+;",
                "when": "editorTextFocus",
                "description": "goto the character and set the cursor after the character"
            },
            {
                "command": "metaGo.selection",
                "key": "alt+shift+;",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.selectLineUp",
                "key": "ctrl+shift+i",
                "mac": "cmd+shift+i",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.selectLineDown",
                "key": "ctrl+i",
                "mac": "cmd+i",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.currentLineToCenter",
                "key": "alt+m",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.currentLineToBottom",
                "key": "alt+b",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.currentLineToTop",
                "key": "alt+t",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.spaceBlockMoveUp",
                "key": "alt+home",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.spaceBlockSelectUp",
                "key": "alt+shift+home",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.spaceBlockMoveDown",
                "key": "alt+end",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.spaceBlockSelectDown",
                "key": "alt+shift+end",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.bookmark.toggle",
                "key": "alt+'",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.bookmark.view",
                "key": "alt+/",
                "when": "editorTextFocus"
            },
            {
                "command": "metaGo.jumpToBracket",
                "key": "ctrl+shift+\\",
                "when": "editorTextFocus"
            }

To configure the keybinding, add the following lines to *keybindings.json* (File -> Preferences -> Keyboard Shortcuts):
## extension Settings
                "metaGo.decoration.backgroundColor": {
                    "type": "string",
                    "default": "Chartreuse,yellow",
                    "description": "one and two character decorator background color"
                },
                "metaGo.decoration.backgroundOpacity": {
                    "type": "string",
                    "default": "0.8"
                },
                "metaGo.decoration.borderColor": {
                    "type": "string",
                    "default": "#1e1e1e"
                },
                "metaGo.decoration.color": {
                    "type": "string",
                    "default": "blue"
                },
                "metaGo.decoration.width": {
                    "type": "number",
                    "default": 9
                },
                "metaGo.decoration.height": {
                    "type": "number",
                    "default": 15
                },
                "metaGo.decoration.fontSize": {
                    "type": "number",
                    "default": 13
                },
                "metaGo.decoration.x": {
                    "type": "number",
                    "default": 1
                },
                "metaGo.decoration.y": {
                    "type": "number",
                    "default": 12
                },
                "metaGo.decoration.fontWeight": {
                    "type": "string",
                    "default": "bold"
                },
                "metaGo.decoration.fontFamily": {
                    "type": "string",
                    "default": "Consolas"
                },
                "metaGo.decoration.upperCase": {
                    "type": "boolean",
                    "default": false
                },
                "metaGo.decoration.characters": {
                    "type": "string",
                    "default": "k, j, d, f, l, s, a, h, g, i, o, n, u, r, v, c, w, e, x, m, b, p, q, t, y, z"
                },
                "metaGo.jumper.findInSelection": {
                    "type": "string",
                    "default": "off"
                },
                "metaGo.jumper.targetIgnoreCase": {
                    "type": "boolean",
                    "default": true
                },
                "metaGo.jumper.timeout": {
                    "type": "number",
                    "default": "12",
                    "description": "timeout value in seconds to cancel metaGo jumper commands."
                },
                "metaGo.jumper.findAllMode": {
                    "type": "string",
                    "default": "on",
                    "description": "on: find all characters on viewable screen area; off: only search the first character of the words that are separated by chars configured in 'wordSeparatorPattern'"
                },
                "metaGo.jumper.wordSeparatorPattern": {
                    "type": "string",
                    "default": "[ ,-.{_(\"'<\\/[+]"
                },
                "metaGo.jumper.screenLineRange": {
                    "type": "number",
                    "default": 50,
                    "description": "how many lines could be showed in one screen"
                },
                "metaGo.bookmark.saveBookmarksInProject": {
                    "type": "boolean",
                    "default": false,
                    "description": "Allow bookmarks to be saved (and restored) locally in the opened Project/Folder instead of VS Code"
                },
                "metaGo.bookmark.gutterIconPath": {
                    "type": "string",
                    "default": "",
                    "description": "Path to another image to be presented as Bookmark"
                }
