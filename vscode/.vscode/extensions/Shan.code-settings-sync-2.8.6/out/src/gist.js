"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileManager_1 = require("./manager/fileManager");
class Gist {
    constructor(gistResponse, en) {
        this.gistResponse = gistResponse;
        this.en = en;
        this.gistId = null;
        this.ownerName = null;
        this.ownerUser = null;
        this.files = null;
        this.publicGist = false;
        this.files = new Array();
        if (gistResponse != null) {
            let gistKeys = Object.keys(this.gistResponse);
            if (gistKeys.indexOf("owner") > -1) {
                this.ownerUser = this.gistResponse["owner"]["login"];
            }
            if (gistKeys.indexOf("public") > -1) {
                this.publicGist = this.gistResponse["public"];
            }
            if (gistKeys.indexOf("files") > -1) {
                var keys = Object.keys(this.gistResponse["files"]);
                keys.forEach(gistName => {
                    if (this.gistResponse["files"][gistName]) {
                        if (this.gistResponse["files"][gistName].content) {
                            var f = new fileManager_1.File(gistName, this.gistResponse["files"][gistName].content, null, gistName);
                            this.files.push(f);
                        }
                    }
                    else {
                        console.log("Sync : " + gistName + " key in response is empty.");
                    }
                });
            }
        }
    }
    AddFile(f) {
        this.files.push(f);
    }
    GetOwnerUser() {
        return this.ownerUser;
    }
    GetOwnerName() {
        return this.ownerName;
    }
    IsPublic() {
        return this.publicGist;
    }
}
exports.Gist = Gist;
//# sourceMappingURL=gist.js.map