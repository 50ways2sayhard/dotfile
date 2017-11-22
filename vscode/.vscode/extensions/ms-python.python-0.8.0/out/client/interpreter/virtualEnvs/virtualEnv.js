"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("../../common/utils");
const OrigPrefixFile = 'orig-prefix.txt';
class VirtualEnv {
    constructor() {
        this.name = 'virtualenv';
    }
    detect(pythonPath) {
        const dir = path.dirname(pythonPath);
        const origPrefixFile = path.join(dir, '..', 'lib', OrigPrefixFile);
        return utils_1.fsExistsAsync(origPrefixFile);
    }
}
exports.VirtualEnv = VirtualEnv;
//# sourceMappingURL=virtualEnv.js.map