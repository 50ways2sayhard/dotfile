"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const location_1 = require("./location");
class BookmarkItem {
    constructor(label, description, detail, commandId, location) {
        this.label = label;
        this.description = description;
        this.detail = detail;
        this.commandId = commandId;
        this.location = location;
    }
}
exports.BookmarkItem = BookmarkItem;
class Document {
    constructor(key, history) {
        this.key = key;
        this.history = history;
        this.bookmarks = new Map();
        this.addBookmark = (bookmark) => {
            let key = bookmark.key;
            if (this.bookmarks.has(key)) {
                return;
            }
            this.bookmarks.set(key, bookmark);
            this.history.add(this.key, key);
        };
        this.removeBookmark = (bookmark) => {
            let key;
            if (typeof bookmark === 'string') {
                key = bookmark;
            }
            else {
                key = bookmark.key;
            }
            if (!this.bookmarks.has(key)) {
                return;
            }
            this.bookmarks.delete(key);
            this.history.remove(this.key, key);
        };
        this.toggleBookmark = (bookmark) => {
            if (this.bookmarks.has(bookmark.key)) {
                this.removeBookmark(bookmark);
            }
            else {
                this.addBookmark(bookmark);
            }
        };
        this.getBookmarkItems = () => {
            return new Promise((resolve, reject) => {
                if (this.bookmarks.size === 0 || !fs.existsSync(this.key)) {
                    this.history.removeDoc(this.key);
                    resolve([]);
                    return;
                }
                let uriDocBookmark = vscode.Uri.file(this.key);
                vscode.workspace.openTextDocument(uriDocBookmark).then(doc => {
                    let items = [];
                    let invalids = [];
                    for (let [key, value] of this.bookmarks) {
                        let lineNumber = value.line + 1;
                        if (lineNumber <= doc.lineCount) {
                            let lineText = doc.lineAt(lineNumber - 1).text;
                            let normalizedPath = Document.normalize(doc.uri.fsPath);
                            items.push(new BookmarkItem(lineNumber.toString(), lineText, normalizedPath, null, new location_1.BookmarkLocation(this, value)));
                        }
                        else {
                            invalids.push(key);
                        }
                    }
                    if (invalids.length > 0) {
                        invalids.forEach((key) => {
                            this.bookmarks.delete(key);
                            this.history.remove(this.key, key);
                        });
                    }
                    resolve(items);
                    return;
                });
            });
        };
        /**
         * clear bookmarks
         */
        this.clear = () => {
            this.bookmarks.clear();
            this.history.removeDoc(this.key);
        };
    }
    static normalize(uri) {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }
    getBookmarkKeys(line, char = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(key);
            }
        }
        return bms;
    }
    getBookmarks(line, char = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(bm);
            }
        }
        return bms;
    }
    modifyBookmark(bookmark, toLine, toChar = -1) {
        const keyBackup = bookmark.key;
        if (bookmark.line === toLine && (toChar === -1 || bookmark.char === toChar))
            return;
        this.bookmarks.delete(keyBackup);
        bookmark.line = toLine;
        if (toChar != -1)
            bookmark.char = toChar;
        let bmReturn = null;
        if (this.bookmarks.has(bookmark.key)) {
            bmReturn = this.bookmarks.get(bookmark.key);
            this.bookmarks.delete(bookmark.key);
        }
        this.bookmarks.set(bookmark.key, bookmark);
        this.history.modify(this.key, keyBackup, bookmark.key);
        return bmReturn;
    }
    modifyBookmarkByLine(line, toLine, char = -1, toChar = -1) {
    }
    removeBookmarks(line) {
        const bms = this.getBookmarkKeys(line);
        bms.forEach(key => this.removeBookmark(key));
        return bms.length > 0;
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map