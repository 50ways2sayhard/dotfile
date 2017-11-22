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
const os = require("os");
const vscode_1 = require("vscode");
const configSettings_1 = require("../../common/configSettings");
const helpers_1 = require("./../../common/helpers");
const utils_1 = require("./../../common/utils");
class DebugLauncher {
    launchDebugger(rootDirectory, testArgs, token, outChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            const pythonSettings = configSettings_1.PythonSettings.getInstance(rootDirectory ? vscode_1.Uri.file(rootDirectory) : undefined);
            // tslint:disable-next-line:no-any
            const def = helpers_1.createDeferred();
            // tslint:disable-next-line:no-any
            const launchDef = helpers_1.createDeferred();
            let outputChannelShown = false;
            utils_1.execPythonFile(rootDirectory, pythonSettings.pythonPath, testArgs, rootDirectory, true, (data) => {
                if (data.startsWith(`READY${os.EOL}`)) {
                    // debug socket server has started.
                    launchDef.resolve();
                    data = data.substring((`READY${os.EOL}`).length);
                }
                if (!outputChannelShown) {
                    outputChannelShown = true;
                    outChannel.show();
                }
                outChannel.append(data);
            }, token).catch(reason => {
                if (!def.rejected && !def.resolved) {
                    def.reject(reason);
                }
            }).then(() => {
                if (!def.rejected && !def.resolved) {
                    def.resolve();
                }
            }).catch(reason => {
                if (!def.rejected && !def.resolved) {
                    def.reject(reason);
                }
            });
            launchDef.promise.then(() => {
                if (!Array.isArray(vscode_1.workspace.workspaceFolders) || vscode_1.workspace.workspaceFolders.length === 0) {
                    throw new Error('Please open a workspace');
                }
                let workspaceFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(rootDirectory));
                if (!workspaceFolder) {
                    workspaceFolder = vscode_1.workspace.workspaceFolders[0];
                }
                return vscode_1.debug.startDebugging(workspaceFolder, {
                    name: 'Debug Unit Test',
                    type: 'python',
                    request: 'attach',
                    localRoot: rootDirectory,
                    remoteRoot: rootDirectory,
                    port: pythonSettings.unitTest.debugPort,
                    secret: 'my_secret',
                    host: 'localhost'
                });
            }).catch(reason => {
                if (!def.rejected && !def.resolved) {
                    def.reject(reason);
                }
            });
            return def.promise;
        });
    }
}
exports.DebugLauncher = DebugLauncher;
//# sourceMappingURL=debugLauncher.js.map