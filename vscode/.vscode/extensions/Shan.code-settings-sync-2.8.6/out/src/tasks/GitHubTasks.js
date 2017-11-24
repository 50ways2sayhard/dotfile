"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const githubService_1 = require("../services/githubService");
const environmentPath_1 = require("../common/environmentPath");
const commons_1 = require("../common/commons");
class GitHubTasks {
    constructor(TOKEN, context) {
        this.TOKEN = TOKEN;
        this.context = context;
        this.gitService = null;
        this.en = null;
        this.com = null;
        this.gitService = new githubService_1.GitHubService(TOKEN);
        this.en = new environmentPath_1.Environment(this.context);
        this.com = new commons_1.Commons(this.en, this.context);
    }
    Create() {
        var self = this;
        return new Promise((resolve, reject) => {
            if (self.TOKEN == "") {
                reject("Sync : Set GitHub Token or set anonymousGist to true from settings.");
            }
        });
        //throw new Error("Method not implemented.");
    }
    Save() {
        throw new Error("Method not implemented.");
    }
    Upload() {
        return null;
    }
    Download() {
        return null;
    }
    Reset() {
        return null;
    }
}
exports.GitHubTasks = GitHubTasks;
//# sourceMappingURL=GitHubTasks.js.map