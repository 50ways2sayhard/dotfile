'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const vscode_1 = require("vscode");
const registry_1 = require("../../common/registry");
const utils_1 = require("../../common/utils");
const interpreterVersion_1 = require("../interpreterVersion");
const helpers_1 = require("./helpers");
const condaEnvFileService_1 = require("./services/condaEnvFileService");
const condaEnvService_1 = require("./services/condaEnvService");
const currentPathService_1 = require("./services/currentPathService");
const KnownPathsService_1 = require("./services/KnownPathsService");
const virtualEnvService_1 = require("./services/virtualEnvService");
const windowsRegistryService_1 = require("./services/windowsRegistryService");
class PythonInterpreterLocatorService {
    constructor(virtualEnvMgr) {
        this.virtualEnvMgr = virtualEnvMgr;
        this.disposables = [];
        this.interpretersPerResource = new Map();
        this.disposables.push(vscode_1.workspace.onDidChangeConfiguration(this.onConfigChanged, this));
    }
    getInterpreters(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceKey = this.getResourceKey(resource);
            if (!this.interpretersPerResource.has(resourceKey)) {
                const interpreters = yield this.getInterpretersPerResource(resource);
                this.interpretersPerResource.set(resourceKey, interpreters);
            }
            // tslint:disable-next-line:no-non-null-assertion
            return this.interpretersPerResource.get(resourceKey);
        });
    }
    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }
    onConfigChanged() {
        this.interpretersPerResource.clear();
    }
    getResourceKey(resource) {
        if (!resource) {
            return '';
        }
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(resource);
        return workspaceFolder ? workspaceFolder.uri.fsPath : '';
    }
    getInterpretersPerResource(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const locators = this.getLocators(resource);
            const promises = locators.map(provider => provider.getInterpreters(resource));
            const listOfInterpreters = yield Promise.all(promises);
            // tslint:disable-next-line:underscore-consistent-invocation
            return _.flatten(listOfInterpreters)
                .map(helpers_1.fixInterpreterDisplayName)
                .map(helpers_1.fixInterpreterPath)
                .reduce((accumulator, current) => {
                if (accumulator.findIndex(item => utils_1.arePathsSame(item.path, current.path)) === -1 &&
                    accumulator.findIndex(item => utils_1.areBasePathsSame(item.path, current.path)) === -1) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
        });
    }
    getLocators(resource) {
        const locators = [];
        const versionService = new interpreterVersion_1.InterpreterVersionService();
        // The order of the services is important.
        if (utils_1.IS_WINDOWS) {
            const windowsRegistryProvider = new windowsRegistryService_1.WindowsRegistryService(new registry_1.RegistryImplementation(), utils_1.Is_64Bit);
            locators.push(windowsRegistryProvider);
            locators.push(new condaEnvService_1.CondaEnvService(windowsRegistryProvider));
        }
        else {
            locators.push(new condaEnvService_1.CondaEnvService());
        }
        // Supplements the above list of conda environments.
        locators.push(new condaEnvFileService_1.CondaEnvFileService(condaEnvFileService_1.getEnvironmentsFile(), versionService));
        locators.push(new virtualEnvService_1.VirtualEnvService(virtualEnvService_1.getKnownSearchPathsForVirtualEnvs(resource), this.virtualEnvMgr, versionService));
        if (!utils_1.IS_WINDOWS) {
            // This must be last, it is possible we have paths returned here that are already returned
            // in one of the above lists.
            locators.push(new KnownPathsService_1.KnownPathsService(KnownPathsService_1.getKnownSearchPathsForInterpreters(), versionService));
        }
        // This must be last, it is possible we have paths returned here that are already returned
        // in one of the above lists.
        locators.push(new currentPathService_1.CurrentPathService(this.virtualEnvMgr, versionService));
        return locators;
    }
}
exports.PythonInterpreterLocatorService = PythonInterpreterLocatorService;
//# sourceMappingURL=index.js.map