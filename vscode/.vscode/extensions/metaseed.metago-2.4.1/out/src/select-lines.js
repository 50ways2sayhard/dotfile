"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const lib_1 = require("./lib");
class SelectLines {
    constructor(context) {
        let disposable = vscode.commands.registerCommand('metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line - 1;
            const selection = editor.selection;
            let anchor = lib_1.Utilities.anchorPosition(selection);
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line + 1, 0);
            const toLine = line >= 0 ? line : 0;
            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });
        context.subscriptions.push(disposable);
        let disposableD = vscode.commands.registerCommand('metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line + 1;
            const selection = editor.selection;
            let anchor = lib_1.Utilities.anchorPosition(selection);
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line, 0);
            const boundary = editor.document.lineCount;
            const toLine = line <= boundary ? line : boundary;
            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });
        context.subscriptions.push(disposableD);
    }
}
exports.SelectLines = SelectLines;
//# sourceMappingURL=select-lines.js.map