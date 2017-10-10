"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extensionConfig_1 = require("./extensionConfig");
const customSetting_1 = require("./customSetting");
class LocalConfig {
    constructor() {
        this.publicGist = false;
        this.userName = null;
        this.name = null;
        this.extConfig = null;
        this.customConfig = null;
        this.extConfig = new extensionConfig_1.ExtensionConfig();
        this.customConfig = new customSetting_1.CustomSetting();
    }
}
exports.LocalConfig = LocalConfig;
//# sourceMappingURL=localConfig.js.map