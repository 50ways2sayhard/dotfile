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
const path = require("path");
const vscode_1 = require("vscode");
const utils_1 = require("../../../common/utils");
const helpers_1 = require("../helpers");
const settings = require("./../../../common/configSettings");
// tslint:disable-next-line:no-require-imports no-var-requires
const untildify = require('untildify');
class VirtualEnvService {
    constructor(knownSearchPaths, virtualEnvMgr, versionProvider) {
        this.knownSearchPaths = knownSearchPaths;
        this.virtualEnvMgr = virtualEnvMgr;
        this.versionProvider = versionProvider;
    }
    getInterpreters(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.suggestionsFromKnownVenvs();
        });
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    suggestionsFromKnownVenvs() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.knownSearchPaths.map(dir => this.lookForInterpretersInVenvs(dir)))
                .then(listOfInterpreters => _.flatten(listOfInterpreters));
        });
    }
    lookForInterpretersInVenvs(pathToCheck) {
        return __awaiter(this, void 0, void 0, function* () {
            return utils_1.fsReaddirAsync(pathToCheck)
                .then(subDirs => Promise.all(this.getProspectiveDirectoriesForLookup(subDirs)))
                .then(dirs => dirs.filter(dir => dir.length > 0))
                .then(dirs => Promise.all(dirs.map(helpers_1.lookForInterpretersInDirectory)))
                .then(pathsWithInterpreters => _.flatten(pathsWithInterpreters))
                .then(interpreters => Promise.all(interpreters.map(interpreter => this.getVirtualEnvDetails(interpreter))));
        });
    }
    getProspectiveDirectoriesForLookup(subDirs) {
        const dirToLookFor = utils_1.IS_WINDOWS ? 'SCRIPTS' : 'BIN';
        return subDirs.map(subDir => utils_1.fsReaddirAsync(subDir).then(dirs => {
            const scriptOrBinDirs = dirs.filter(dir => {
                const folderName = path.basename(dir);
                return folderName.toUpperCase() === dirToLookFor;
            });
            return scriptOrBinDirs.length === 1 ? scriptOrBinDirs[0] : '';
        }));
    }
    getVirtualEnvDetails(interpreter) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                this.versionProvider.getVersion(interpreter, path.basename(interpreter)),
                this.virtualEnvMgr.detect(interpreter)
            ])
                .then(([displayName, virtualEnv]) => {
                const virtualEnvSuffix = virtualEnv ? virtualEnv.name : this.getVirtualEnvironmentRootDirectory(interpreter);
                return {
                    displayName: `${displayName} (${virtualEnvSuffix})`.trim(),
                    path: interpreter
                };
            });
        });
    }
    getVirtualEnvironmentRootDirectory(interpreter) {
        return path.basename(path.dirname(path.dirname(interpreter)));
    }
}
exports.VirtualEnvService = VirtualEnvService;
function getKnownSearchPathsForVirtualEnvs(resource) {
    const paths = [];
    if (!utils_1.IS_WINDOWS) {
        const defaultPaths = ['/Envs', '/.virtualenvs', '/.pyenv', '/.pyenv/versions'];
        defaultPaths.forEach(p => {
            paths.push(untildify(`~${p}`));
        });
    }
    const venvPath = settings.PythonSettings.getInstance(resource).venvPath;
    if (venvPath) {
        paths.push(untildify(venvPath));
    }
    if (Array.isArray(vscode_1.workspace.workspaceFolders) && vscode_1.workspace.workspaceFolders.length > 0) {
        if (resource && vscode_1.workspace.workspaceFolders.length > 1) {
            const wkspaceFolder = vscode_1.workspace.getWorkspaceFolder(resource);
            if (wkspaceFolder) {
                paths.push(wkspaceFolder.uri.fsPath);
            }
        }
        else {
            paths.push(vscode_1.workspace.workspaceFolders[0].uri.fsPath);
        }
    }
    return paths;
}
exports.getKnownSearchPathsForVirtualEnvs = getKnownSearchPathsForVirtualEnvs;
//# sourceMappingURL=virtualEnvService.js.map