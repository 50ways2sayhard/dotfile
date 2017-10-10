"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const bookmark_1 = require("./model/bookmark");
class StickyBookmark {
    constructor(manager) {
        this.manager = manager;
        this.moveStickyBookmarks = (direction) => {
            let char;
            let updatedBookmark = false;
            let diffLine;
            let selection = vscode.window.activeTextEditor.selection;
            let lineRange = [selection.start.line, selection.end.line];
            let lineMin = Math.min.apply(this, lineRange);
            let lineMax = Math.max.apply(this, lineRange);
            if (selection.end.character === 0 && !selection.isSingleLine) {
                let lineAt = vscode.window.activeTextEditor.document.lineAt(selection.end.line);
                let posMin = new vscode.Position(selection.start.line + 1, selection.start.character);
                let posMax = new vscode.Position(selection.end.line, lineAt.range.end.character);
                vscode.window.activeTextEditor.selection = new vscode.Selection(posMin, posMax);
                lineMax--;
            }
            const doc = this.manager.activeDocument;
            let passiveMoveDiff = lineMax - lineMin + 1;
            let passiveMoveLine;
            if (direction === "up") {
                diffLine = -1;
                passiveMoveLine = lineMin - 1;
            }
            else if (direction === "down") {
                diffLine = 1;
                passiveMoveLine = lineMax + 1;
                passiveMoveDiff = 0 - passiveMoveDiff;
            }
            let bmsOfSameLineAndChar = [];
            let passiveMoveBookmarks = doc.getBookmarks(passiveMoveLine);
            passiveMoveBookmarks.forEach((bm) => {
                const b = doc.modifyBookmark(bm, passiveMoveLine + passiveMoveDiff);
                bmsOfSameLineAndChar.push(b);
            });
            lineRange = [];
            for (let i = lineMin; i <= lineMax; i++) {
                lineRange.push(i);
            }
            lineRange = lineRange.sort();
            if (diffLine > 0) {
                lineRange = lineRange.reverse();
            }
            for (let i of lineRange) {
                for (let bm of doc.bookmarks.values()) {
                    if (bm.line === i) {
                        if (passiveMoveBookmarks.indexOf(bm) !== -1)
                            continue;
                        const toLine = bm.line + diffLine;
                        doc.modifyBookmark(bm, toLine);
                        updatedBookmark = true;
                    }
                }
            }
            bmsOfSameLineAndChar.forEach((bm) => {
                doc.addBookmark(new bookmark_1.Bookmark(bm.line + diffLine, bm.char));
                updatedBookmark = true;
            });
            return updatedBookmark;
        };
    }
    stickyBookmarks(event) {
        let diffLine;
        let updatedBookmark = false;
        let doc = this.manager.activeDocument;
        let bms = doc.bookmarks;
        const range = event.contentChanges[0].range;
        if (this.HadOnlyOneValidContentChange(event)) {
            // add or delete line case
            if (event.document.lineCount !== this.activeEditorCountLine) {
                diffLine = event.document.lineCount - this.activeEditorCountLine;
                // remove lines
                if (event.document.lineCount < this.activeEditorCountLine) {
                    for (let i = range.start.line; i <= range.end.line; i++) {
                        updatedBookmark = doc.removeBookmarks(i) || updatedBookmark;
                    }
                }
                for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                    let eventLine = range.start.line;
                    let eventCharacter = range.start.character;
                    // indent ?
                    if (eventCharacter > 0) {
                        let textInEventLine = vscode.window.activeTextEditor.document.lineAt(eventLine).text;
                        textInEventLine = textInEventLine.replace(/\t/g, "").replace(/\s/g, "");
                        if (textInEventLine === "") {
                            eventCharacter = 0;
                        }
                    }
                    if (((bm.line > eventLine) && (eventCharacter > 0)) || ((bm.line >= eventLine) && (eventCharacter === 0))) {
                        let newLine = bm.line + diffLine;
                        if (newLine < 0) {
                            newLine = 0;
                        }
                        bm.line = newLine;
                        updatedBookmark = true;
                    }
                }
            }
            else if (range.start.line === range.end.line && range.start.character !== range.end.character &&
                event.contentChanges[0].text === '') {
                const charDiff = range.end.character - range.start.character;
                doc.getBookmarks(range.start.line).forEach((m) => {
                    if (m.char >= range.end.character) {
                        doc.modifyBookmark(m, range.start.line, m.char - charDiff);
                    }
                    else {
                        doc.removeBookmark(m);
                    }
                    updatedBookmark = true;
                });
            }
            else if (range.start.line === range.end.line && range.start.character === range.end.character &&
                event.contentChanges[0].text !== '') {
                doc.getBookmarks(range.start.line).forEach((m) => {
                    if (m.char >= range.end.character) {
                        doc.modifyBookmark(m, range.start.line, m.char + event.contentChanges[0].text.length);
                        updatedBookmark = true;
                    }
                });
            }
            // paste case
            if (!updatedBookmark && (event.contentChanges[0].text.length > 1)) {
                let selection = vscode.window.activeTextEditor.selection;
                let lineRange = [selection.start.line, selection.end.line];
                let lineMin = Math.min.apply(this, lineRange);
                let lineMax = Math.max.apply(this, lineRange);
                if (selection.start.character > 0) {
                    lineMin++;
                }
                if (selection.end.character < vscode.window.activeTextEditor.document.lineAt(selection.end).range.end.character) {
                    lineMax--;
                }
                if (lineMin <= lineMax) {
                    for (let i = lineMin; i <= lineMax; i++) {
                        const invalidKeys = [];
                        for (let [key, bm] of bms) {
                            if (bm.line === i) {
                                invalidKeys.push(key);
                                updatedBookmark = true;
                            }
                        }
                        invalidKeys.forEach((key) => bms.delete(key));
                    }
                }
            }
        }
        else if (event.contentChanges.length === 2) {
            // move line up and move line down case
            if (vscode.window.activeTextEditor.selections.length === 1) {
                if (event.contentChanges[0].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("down");
                }
                else if (event.contentChanges[1].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("up");
                }
            }
        }
        return updatedBookmark;
    }
    HadOnlyOneValidContentChange(event) {
        const length = event.contentChanges.length;
        const range = event.contentChanges[0].range;
        // not valid
        if ((length > 2) || (length === 0)) {
            return false;
        }
        // normal behavior - only 1
        if (length === 1) {
            return true;
        }
        else {
            if (length === 2) {
                // check if the first range is 'equal' and if the second is 'empty', do trim
                let fistRangeEquals = (range.start.character === range.end.character) &&
                    (range.start.line === range.end.line);
                let secondRangeEmpty = (event.contentChanges[1].text === "") &&
                    (event.contentChanges[1].range.start.line === event.contentChanges[1].range.end.line) &&
                    (event.contentChanges[1].range.start.character === 0) &&
                    (event.contentChanges[1].range.end.character > 0);
                return fistRangeEquals && secondRangeEmpty;
            }
        }
    }
}
exports.StickyBookmark = StickyBookmark;
//# sourceMappingURL=sticky.js.map