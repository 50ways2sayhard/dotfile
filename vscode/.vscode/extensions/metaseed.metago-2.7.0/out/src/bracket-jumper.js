"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const lib_1 = require("./lib");
class bracket {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.counter = 0;
    }
}
class BracketJumper {
    constructor(context) {
        this.bracketPairs = [new bracket('[', ']'), new bracket('{', '}'), new bracket('(', ')')];
        let disposable = vscode.commands.registerCommand('metaGo.jumpToBracket', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            let line = editor.document.lineAt(fromLine);
            this.clearBracketsCounter();
            if (this.isBracket(line.text[fromChar]) || this.isBracket(line.text[fromChar - 1])) {
                vscode.commands.executeCommand('editor.action.jumpToBracket');
                return;
            }
            if (this.testLine(line, fromChar))
                return;
            while (--fromLine >= 0) {
                let line = editor.document.lineAt(fromLine);
                if (this.testLine(line))
                    return;
            }
        });
        context.subscriptions.push(disposable);
    }
    testLine(line, tillIndex = -1) {
        if (tillIndex === -1) {
            tillIndex = line.text.length;
        }
        for (let i = tillIndex - 1; i >= line.firstNonWhitespaceCharacterIndex; --i) {
            let char = line.text[i];
            let index = -1;
            if (this.bracketPairs.some((c, i) => { index = i; return c.end === char; })) {
                this.bracketPairs[index].counter++;
            }
            else if (this.bracketPairs.some((c, i) => { index = i; return c.start === char; })) {
                if (this.bracketPairs[index].counter === 0) {
                    let lineN = line.lineNumber;
                    lib_1.Utilities.goto(lineN, i);
                    let position = new vscode.Position(lineN, i);
                    let range = new vscode.Range(position, position);
                    vscode.window.activeTextEditor.revealRange(range);
                    return true;
                }
                this.bracketPairs[index].counter--;
            }
        }
        return false;
    }
    isBracket(char) {
        return this.bracketPairs.some((c) => c.start === char || c.end === char);
    }
    isBracketStart(char) {
        return this.bracketPairs.some((c) => c.start === char);
    }
    isBracketEnd(char) {
        return this.bracketPairs.some((c, i) => c.end === char);
    }
    clearBracketsCounter() {
        this.bracketPairs.forEach((c) => c.counter = 0);
    }
}
exports.BracketJumper = BracketJumper;
//# sourceMappingURL=bracket-jumper.js.map