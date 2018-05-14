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
const path = require("path");
const fs = require("fs");
const vscode = require("vscode");
const bookmark_1 = require("./model/bookmark");
const document_1 = require("./model/document");
const manager_1 = require("./manager");
const history_1 = require("./model/history");
class Storage {
    constructor(config, context, manager) {
        this.config = config;
        this.context = context;
        this.manager = manager;
        this.load = () => {
            if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
                let fPath = path.join(vscode.workspace.rootPath, ".vscode", "metago_bookmarks.json");
                if (!fs.existsSync(fPath)) {
                    return false;
                }
                try {
                    let str = fs.readFileSync(fPath).toString();
                    this.updateManagerData(JSON.parse(str));
                    return true;
                }
                catch (error) {
                    vscode.window.showErrorMessage("Error loading Bookmarks: " + error.toString());
                    return false;
                }
            }
            else {
                let savedBookmarks = this.context.workspaceState.get("metago_bookmarks", "");
                if (savedBookmarks !== "") {
                    this.updateManagerData(JSON.parse(savedBookmarks));
                }
                return savedBookmarks !== "";
            }
        };
        this.save = () => __awaiter(this, void 0, void 0, function* () {
            if (this.manager.documents.size === 0) {
                return;
            }
            if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
                let fPath = path.join(vscode.workspace.rootPath, ".vscode", "metago_bookmarks.json");
                if (!fs.existsSync(path.dirname(fPath))) {
                    fs.mkdirSync(path.dirname(fPath));
                }
                const manager = yield this.getManagerToSave();
                let str = JSON.stringify(manager, null, "    ");
                //let root = JSON.stringify(vscode.workspace.rootPath).replace(/"/g, '').replace(/\\/g, '\\\\')
                //str = str.replace(new RegExp(root, 'gm'), "$ROOTPATH$");
                fs.writeFileSync(fPath, str);
            }
            else {
                this.context.workspaceState.update("metago_bookmarks", JSON.stringify(yield this.getManagerToSave()));
            }
        });
        this.updateManagerData = (jsonObject) => {
            if (jsonObject === "") {
                return;
            }
            let jsonBookmarks = jsonObject.documents;
            for (let key in jsonBookmarks) {
                const docKey = key.replace("$ROOTPATH$", vscode.workspace.rootPath);
                const doc = this.manager.addDocumentIfNotExist(docKey);
                for (let bmKey in jsonBookmarks[key].bookmarks) {
                    const bm = jsonBookmarks[key].bookmarks[bmKey];
                    doc.addBookmark(new bookmark_1.Bookmark(bm.line, bm.char));
                }
            }
            this.manager.history.history.length = 0;
            jsonObject.history.history.forEach((item) => {
                const docKey = item.documentKey.replace('$ROOTPATH$', vscode.workspace.rootPath);
                this.manager.history.history.push(new history_1.HistoryItem(docKey, item.bookmarkKey));
            });
            this.manager.history.index = Math.min(jsonObject.history.index, this.manager.history.history.length - 1);
        };
        this.getManagerToSave = () => __awaiter(this, void 0, void 0, function* () {
            yield this.manager.tidyBookmarks();
            let managerToSave = new manager_1.BookmarkManager();
            for (let [docKey, doc] of this.manager.documents) {
                const key = docKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
                let newDoc = new document_1.Document(key, undefined);
                managerToSave.documents[key] = newDoc;
                for (let [bmKey, bm] of doc.bookmarks) {
                    newDoc.bookmarks[bmKey] = new bookmark_1.Bookmark(bm.line, bm.char);
                }
            }
            managerToSave.history.index = this.manager.history.index;
            this.manager.history.history.forEach(item => {
                const docKey = item.documentKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
                managerToSave.history.history.push(new history_1.HistoryItem(docKey, item.bookmarkKey));
            });
            return managerToSave;
        });
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map