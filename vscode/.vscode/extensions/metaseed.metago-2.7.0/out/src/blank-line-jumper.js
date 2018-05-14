"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const lib_1 = require("./lib");
class BlankLineJumper {
    constructor(context) {
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.spaceBlockMoveUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, true));
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.spaceBlockMoveDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, false));
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.spaceBlockSelectUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, true), lib_1.Utilities.anchorPosition(editor.selection));
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.spaceBlockSelectDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, false), lib_1.Utilities.anchorPosition(editor.selection));
        }));
    }
    nextPosition(document, position, up = false) {
        const step = up ? -1 : 1;
        const boundary = up ? 0 : document.lineCount - 1;
        let index = position.line + step;
        if (position.line === boundary)
            return position.line;
        return this.afterBlock(document, step, boundary, position.line);
    }
    afterBlock(document, step, boundary, index, startedBlock = false) {
        const line = document.lineAt(index);
        return index === boundary || startedBlock && line.isEmptyOrWhitespace
            ? index
            : this.afterBlock(document, step, boundary, index + step, startedBlock || !line.isEmptyOrWhitespace);
    }
    markSelection(editor, next, anchor) {
        const active = editor.selection.active.with(next, 0);
        editor.selection = new vscode.Selection(anchor || active, active);
        editor.revealRange(new vscode.Range(active, active));
    }
}
exports.BlankLineJumper = BlankLineJumper;
//# sourceMappingURL=blank-line-jumper.js.map