"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("../../common/utils");
const pyEnvCfgFileName = 'pyvenv.cfg';
class VEnv {
    constructor() {
        this.name = 'venv';
    }
    detect(pythonPath) {
        const dir = path.dirname(pythonPath);
        const pyEnvCfgPath = path.join(dir, '..', pyEnvCfgFileName);
        return utils_1.fsExistsAsync(pyEnvCfgPath);
    }
}
exports.VEnv = VEnv;
//# sourceMappingURL=venv.js.map