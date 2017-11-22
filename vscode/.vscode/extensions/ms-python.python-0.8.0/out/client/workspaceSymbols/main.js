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
const vscode = require("vscode");
const generator_1 = require("./generator");
const installer_1 = require("../common/installer");
const utils_1 = require("../common/utils");
const helpers_1 = require("../common/helpers");
const constants_1 = require("../common/constants");
const provider_1 = require("./provider");
const vscode_1 = require("vscode");
const MAX_NUMBER_OF_ATTEMPTS_TO_INSTALL_AND_BUILD = 2;
class WorkspaceSymbols {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.generators = [];
        this.disposables = [];
        this.disposables.push(this.outputChannel);
        this.installer = new installer_1.Installer();
        this.disposables.push(this.installer);
        this.registerCommands();
        this.initializeGenerators();
        vscode.languages.registerWorkspaceSymbolProvider(new provider_1.WorkspaceSymbolProvider(this.generators, this.outputChannel));
        this.buildWorkspaceSymbols(true);
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(() => this.initializeGenerators()));
    }
    initializeGenerators() {
        while (this.generators.length > 0) {
            const generator = this.generators.shift();
            generator.dispose();
        }
        if (Array.isArray(vscode.workspace.workspaceFolders)) {
            vscode.workspace.workspaceFolders.forEach(wkSpc => {
                this.generators.push(new generator_1.Generator(wkSpc.uri, this.outputChannel));
            });
        }
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Build_Workspace_Symbols, (rebuild = true, token) => {
            this.buildWorkspaceSymbols(rebuild, token);
        }));
    }
    registerOnSaveHandlers() {
        this.disposables.push(vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument.bind(this)));
    }
    onDidSaveTextDocument(textDocument) {
        if (textDocument.languageId === constants_1.PythonLanguage.language) {
            this.rebuildTags();
        }
    }
    rebuildTags() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(() => {
            this.buildWorkspaceSymbols(true);
        }, 5000);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    buildWorkspaceSymbols(rebuild = true, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (token && token.isCancellationRequested) {
                return Promise.resolve([]);
            }
            if (this.generators.length === 0) {
                return Promise.resolve([]);
            }
            let promptPromise;
            let promptResponse;
            return this.generators.map((generator) => __awaiter(this, void 0, void 0, function* () {
                if (!generator.enabled) {
                    return;
                }
                const exists = yield utils_1.fsExistsAsync(generator.tagFilePath);
                // if file doesn't exist, then run the ctag generator
                // Or check if required to rebuild
                if (!rebuild && exists) {
                    return;
                }
                for (let counter = 0; counter < MAX_NUMBER_OF_ATTEMPTS_TO_INSTALL_AND_BUILD; counter++) {
                    try {
                        yield generator.generateWorkspaceTags();
                        return;
                    }
                    catch (error) {
                        if (!helpers_1.isNotInstalledError(error)) {
                            this.outputChannel.show();
                            return;
                        }
                    }
                    if (!token || token.isCancellationRequested) {
                        return;
                    }
                    // Display prompt once for all workspaces
                    if (promptPromise) {
                        promptResponse = yield promptPromise;
                        continue;
                    }
                    else {
                        promptPromise = this.installer.promptToInstall(installer_1.Product.ctags, vscode_1.workspace.workspaceFolders[0].uri);
                        promptResponse = yield promptPromise;
                    }
                    if (promptResponse !== installer_1.InstallerResponse.Installed || (!token || token.isCancellationRequested)) {
                        return;
                    }
                }
            }));
        });
    }
}
exports.WorkspaceSymbols = WorkspaceSymbols;
//# sourceMappingURL=main.js.map