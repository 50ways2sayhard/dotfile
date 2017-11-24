"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//"use strict";
const environmentPath_1 = require("../common/environmentPath");
class CloudSetting {
    constructor() {
        this.lastUpload = null;
        this.extensionVersion = null;
        this.extensionVersion = "v" + environmentPath_1.Environment.getVersion();
    }
}
exports.CloudSetting = CloudSetting;
//# sourceMappingURL=cloudSetting.js.map