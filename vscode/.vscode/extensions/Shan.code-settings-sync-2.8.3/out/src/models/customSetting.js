"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//"use strict";
const environmentPath_1 = require("../common/environmentPath");
class CustomSetting {
    constructor() {
        this.ignoreUploadFiles = null;
        this.ignoreUploadFolders = null;
        this.ignoreUploadSettings = null;
        this.replaceCodeSettings = null;
        this.gistDescription = null;
        this.version = 0;
        this.token = null;
        this.ignoreUploadFiles = new Array();
        this.ignoreUploadFolders = new Array();
        this.replaceCodeSettings = new Object();
        this.ignoreUploadSettings = new Array();
        this.ignoreUploadFolders.push("workspaceStorage");
        this.ignoreUploadFiles.push("projects.json");
        this.ignoreUploadFiles.push("projects_cache_git.json");
        this.gistDescription = "Visual Studio Code Settings Sync Gist";
        this.version = environmentPath_1.Environment.CURRENT_VERSION;
        this.token = "";
    }
}
exports.CustomSetting = CustomSetting;
//# sourceMappingURL=customSetting.js.map