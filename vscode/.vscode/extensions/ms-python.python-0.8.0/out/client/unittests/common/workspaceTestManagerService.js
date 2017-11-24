"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class WorkspaceTestManagerService {
    constructor(outChannel, testManagerServiceFactory) {
        this.outChannel = outChannel;
        this.testManagerServiceFactory = testManagerServiceFactory;
        this.workspaceTestManagers = new Map();
        this.disposables = [];
    }
    dispose() {
        this.workspaceTestManagers.forEach(info => info.dispose());
    }
    getTestManager(resource) {
        const wkspace = this.getWorkspace(resource);
        this.ensureTestManagerService(wkspace);
        return this.workspaceTestManagers.get(wkspace.fsPath).getTestManager();
    }
    getTestWorkingDirectory(resource) {
        const wkspace = this.getWorkspace(resource);
        this.ensureTestManagerService(wkspace);
        return this.workspaceTestManagers.get(wkspace.fsPath).getTestWorkingDirectory();
    }
    getPreferredTestManager(resource) {
        const wkspace = this.getWorkspace(resource);
        this.ensureTestManagerService(wkspace);
        return this.workspaceTestManagers.get(wkspace.fsPath).getPreferredTestManager();
    }
    getWorkspace(resource) {
        if (!Array.isArray(vscode_1.workspace.workspaceFolders) || vscode_1.workspace.workspaceFolders.length === 0) {
            const noWkspaceMessage = 'Please open a workspace';
            this.outChannel.appendLine(noWkspaceMessage);
            throw new Error(noWkspaceMessage);
        }
        if (!resource || vscode_1.workspace.workspaceFolders.length === 1) {
            return vscode_1.workspace.workspaceFolders[0].uri;
        }
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(resource);
        if (workspaceFolder) {
            return workspaceFolder.uri;
        }
        const message = `Resource '${resource.fsPath}' does not belong to any workspace`;
        this.outChannel.appendLine(message);
        throw new Error(message);
    }
    ensureTestManagerService(wkspace) {
        if (!this.workspaceTestManagers.has(wkspace.fsPath)) {
            this.workspaceTestManagers.set(wkspace.fsPath, this.testManagerServiceFactory.createTestManagerService(wkspace));
        }
    }
}
exports.WorkspaceTestManagerService = WorkspaceTestManagerService;
//# sourceMappingURL=workspaceTestManagerService.js.map