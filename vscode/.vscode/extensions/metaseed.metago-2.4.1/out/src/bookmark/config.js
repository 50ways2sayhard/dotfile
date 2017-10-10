"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class BookmarkConfig {
    loadConfig() {
        let config = vscode.workspace.getConfiguration("metaGo");
        this.pathIcon = config.get("bookmark.gutterIconPath", "");
        this.saveBookmarksInProject = config.get('bookmark.saveBookmarksInProject', true);
    }
}
exports.BookmarkConfig = BookmarkConfig;
//# sourceMappingURL=config.js.map