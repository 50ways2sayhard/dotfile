'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const config_1 = require("./config");
const metajumper_1 = require("./metajumper");
const current_line_scroller_1 = require("./current-line-scroller");
const blank_line_jumper_1 = require("./blank-line-jumper");
const select_lines_1 = require("./select-lines");
const bookmark_1 = require("./bookmark");
const bracket_jumper_1 = require("./bracket-jumper");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "metago" is now active!');
    let config = new config_1.Config();
    config.loadConfig();
    // Event to update active configuration items when changed without restarting vscode
    vscode.workspace.onDidChangeConfiguration((e) => {
        config.loadConfig();
        metaJumper.updateConfig();
    });
    let metaJumper = new metajumper_1.MetaJumper(context, config);
    let centerEditor = new current_line_scroller_1.CurrentLineScroller(context);
    let spaceBlockJumper = new blank_line_jumper_1.BlankLineJumper(context);
    let selectLineUp = new select_lines_1.SelectLines(context);
    let bookmark = new bookmark_1.BookmarkExt(context, config.bookmark);
    let bracketJumper = new bracket_jumper_1.BracketJumper(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map