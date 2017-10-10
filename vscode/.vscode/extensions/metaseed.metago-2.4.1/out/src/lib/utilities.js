"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Utilities {
    static goto(line, character) {
        this.select(line, character, line, character);
    }
    static select(fromLine, fromCharacter, toLine, toCharacter) {
        let editor = vscode.window.activeTextEditor;
        const startRange = new vscode.Position(fromLine, fromCharacter);
        const endRange = new vscode.Position(toLine, toCharacter);
        editor.selection = new vscode.Selection(startRange, endRange);
        const range = new vscode.Range(startRange, endRange);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    static anchorPosition(selection) {
        return selection.active.line === selection.end.line ? selection.start : selection.end;
    }
}
exports.Utilities = Utilities;
//# sourceMappingURL=utilities.js.map