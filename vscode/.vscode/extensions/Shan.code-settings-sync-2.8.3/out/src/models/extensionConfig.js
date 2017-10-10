"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExtensionConfig {
    constructor() {
        this.gist = null;
        this.lastUpload = null;
        this.autoDownload = false;
        this.autoUpload = false;
        this.lastDownload = null;
        this.forceDownload = false;
        this.anonymousGist = false;
        this.host = null;
        this.pathPrefix = null;
        this.quietSync = false;
        this.askGistName = false;
    }
}
exports.ExtensionConfig = ExtensionConfig;
//# sourceMappingURL=extensionConfig.js.map