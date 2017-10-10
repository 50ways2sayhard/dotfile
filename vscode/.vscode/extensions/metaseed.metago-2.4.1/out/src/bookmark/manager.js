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
const fs = require("fs");
const document_1 = require("./model/document");
const bookmark_1 = require("./model/bookmark");
const history_1 = require("./model/history");
const location_1 = require("./model/location");
class BookmarkManager {
    constructor() {
        this.documents = new Map();
        this.history = new history_1.History();
        this._activeDocument = undefined;
        this.addDocumentIfNotExist = (uri, document) => {
            uri = document_1.Document.normalize(uri);
            if (!this.documents.has(uri)) {
                let doc;
                if (document) {
                    doc = document;
                }
                else {
                    doc = new document_1.Document(uri, this.history);
                }
                this.documents.set(uri, doc);
                return doc;
            }
            return this.documents.get(uri);
        };
        this.tidyBookmarks = () => __awaiter(this, void 0, void 0, function* () {
            for (let [key, doc] of this.documents) {
                yield doc.getBookmarkItems();
                if (doc.bookmarks.size === 0) {
                    this.documents.delete(key);
                }
            }
        });
        this.toggleBookmark = () => {
            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to toggle bookmarks");
                return;
            }
            let line = vscode.window.activeTextEditor.selection.active.line;
            let char = vscode.window.activeTextEditor.selection.active.character;
            let doc = this.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
            this.activeDocument = doc;
            this.activeDocument.toggleBookmark(new bookmark_1.Bookmark(line, char));
        };
        this.nextBookmark = (direction = location_1.JumpDirection.FORWARD) => {
            return new Promise((resolve, reject) => {
                const bm = direction === location_1.JumpDirection.FORWARD ? this.history.next() : this.history.previous();
                if (bm === null) {
                    resolve(location_1.BookmarkLocation.NO_BOOKMARKS);
                    return;
                }
                if (!this.documents.has(bm.documentKey)) {
                    this.history.removeDoc(bm.documentKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                if (!this.documents.get(bm.documentKey).bookmarks.has(bm.bookmarkKey)) {
                    this.history.remove(bm.documentKey, bm.bookmarkKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                if (!fs.existsSync(bm.documentKey)) {
                    this.documents.delete(bm.documentKey);
                    this.history.removeDoc(bm.documentKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                const doc = this.documents.get(bm.documentKey);
                return resolve(new location_1.BookmarkLocation(doc, doc.bookmarks.get(bm.bookmarkKey)));
            });
        };
        this.clear = () => {
            for (let [key, doc] of this.documents) {
                doc.clear();
            }
        };
    }
    get activeDocument() {
        return this._activeDocument;
    }
    set activeDocument(doc) {
        this._activeDocument = doc;
        if (!this.documents.has(doc.key)) {
            this.documents.set(doc.key, doc);
        }
    }
    get size() {
        let counter = 0;
        let func = () => {
            for (let [key, doc] of this.documents) {
                counter += doc.bookmarks.size;
            }
        };
        func();
        return counter;
    }
}
exports.BookmarkManager = BookmarkManager;
//# sourceMappingURL=manager.js.map