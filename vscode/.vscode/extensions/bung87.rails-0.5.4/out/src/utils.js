"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
function dectFileType(filePath) {
    for (var [key, value] of constants_1.FileTypeRelPath) {
        if (filePath.indexOf(value) >= 0) {
            return key;
        }
    }
    return constants_1.FileType.Unkown;
}
exports.dectFileType = dectFileType;
//# sourceMappingURL=utils.js.map