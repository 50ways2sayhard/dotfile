"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ViewPort {
    constructor() {
        this.getViewPortBoundary = () => {
            let editor = vscode.window.activeTextEditor;
            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            return vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortTop',
                select: false
            }).then(() => {
                let topLine = editor.selection.active.line;
                return vscode.commands.executeCommand("cursorMove", {
                    to: 'viewPortBottom',
                    select: false
                })
                    .then(() => {
                    let bottomLine = editor.selection.active.line;
                    let margin = bottomLine - topLine;
                    // back
                    editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
                    this._linesInViewPort = margin;
                    return margin;
                });
            });
        };
        // private viewPortCenter():number{
        //  when getCenterLineInViewPort exposed to extension we should switch
        //  to this api
        //  cursor.cursors.primaryCursor.getCenterLineInViewPort();
        // }
    }
    moveCursorToCenter(select) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortCenter',
                select: select
            });
        });
    }
}
exports.ViewPort = ViewPort;
//# sourceMappingURL=viewport.js.map