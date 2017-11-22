"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TestCollectionStorageService {
    constructor() {
        this.testsIndexedByWorkspaceUri = new Map();
    }
    getTests(wkspace) {
        const workspaceFolder = this.getWorkspaceFolderPath(wkspace) || '';
        return this.testsIndexedByWorkspaceUri.has(workspaceFolder) ? this.testsIndexedByWorkspaceUri.get(workspaceFolder) : undefined;
    }
    storeTests(wkspace, tests) {
        const workspaceFolder = this.getWorkspaceFolderPath(wkspace) || '';
        this.testsIndexedByWorkspaceUri.set(workspaceFolder, tests);
    }
    dispose() {
        this.testsIndexedByWorkspaceUri.clear();
    }
    getWorkspaceFolderPath(resource) {
        const folder = vscode_1.workspace.getWorkspaceFolder(resource);
        return folder ? folder.uri.path : undefined;
    }
}
exports.TestCollectionStorageService = TestCollectionStorageService;
//# sourceMappingURL=storageService.js.map