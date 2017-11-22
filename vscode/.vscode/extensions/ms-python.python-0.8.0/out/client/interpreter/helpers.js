"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const vscode_1 = require("vscode");
const registry_1 = require("../common/registry");
const utils_1 = require("../common/utils");
const condaEnvService_1 = require("./locators/services/condaEnvService");
const windowsRegistryService_1 = require("./locators/services/windowsRegistryService");
function getFirstNonEmptyLineFromMultilineString(stdout) {
    if (!stdout) {
        return '';
    }
    const lines = stdout.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
    return lines.length > 0 ? lines[0] : '';
}
exports.getFirstNonEmptyLineFromMultilineString = getFirstNonEmptyLineFromMultilineString;
function getActiveWorkspaceUri() {
    if (!Array.isArray(vscode_1.workspace.workspaceFolders) || vscode_1.workspace.workspaceFolders.length === 0) {
        return undefined;
    }
    if (vscode_1.workspace.workspaceFolders.length === 1) {
        return { folderUri: vscode_1.workspace.workspaceFolders[0].uri, configTarget: vscode_1.ConfigurationTarget.Workspace };
    }
    if (vscode_1.window.activeTextEditor) {
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.window.activeTextEditor.document.uri);
        if (workspaceFolder) {
            return { configTarget: vscode_1.ConfigurationTarget.WorkspaceFolder, folderUri: workspaceFolder.uri };
        }
    }
    return undefined;
}
exports.getActiveWorkspaceUri = getActiveWorkspaceUri;
function getCondaVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        let condaService;
        if (utils_1.IS_WINDOWS) {
            const windowsRegistryProvider = new windowsRegistryService_1.WindowsRegistryService(new registry_1.RegistryImplementation(), utils_1.Is_64Bit);
            condaService = new condaEnvService_1.CondaEnvService(windowsRegistryProvider);
        }
        else {
            condaService = new condaEnvService_1.CondaEnvService();
        }
        return condaService.getCondaFile()
            .then((condaFile) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                child_process.execFile(condaFile, ['--version'], (_, stdout) => {
                    if (stdout && stdout.length > 0) {
                        resolve(getFirstNonEmptyLineFromMultilineString(stdout));
                    }
                    else {
                        reject();
                    }
                });
            });
        }));
    });
}
exports.getCondaVersion = getCondaVersion;
//# sourceMappingURL=helpers.js.map