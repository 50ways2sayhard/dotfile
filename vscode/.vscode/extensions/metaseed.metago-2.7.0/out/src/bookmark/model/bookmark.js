"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Bookmark {
    constructor(line, char) {
        this.line = line;
        this.char = char;
    }
    static Create(position) {
        return new Bookmark(position.line, position.character);
    }
    getPosition() {
        return new vscode.Position(this.line, this.char);
    }
    get key() {
        return this.line + ':' + this.char;
    }
}
exports.Bookmark = Bookmark;
//# sourceMappingURL=bookmark.js.map