"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookmark_1 = require("./bookmark");
var JumpDirection;
(function (JumpDirection) {
    JumpDirection[JumpDirection["FORWARD"] = 0] = "FORWARD";
    JumpDirection[JumpDirection["BACKWARD"] = 1] = "BACKWARD";
})(JumpDirection = exports.JumpDirection || (exports.JumpDirection = {}));
;
class BookmarkLocation {
    constructor(document, bookmark) {
        this.document = document;
        this.bookmark = bookmark;
    }
}
BookmarkLocation.NO_BOOKMARKS = new BookmarkLocation(null, new bookmark_1.Bookmark(-1, 0));
exports.BookmarkLocation = BookmarkLocation;
//# sourceMappingURL=location.js.map