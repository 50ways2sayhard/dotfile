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
const child_process = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const versionUtils_1 = require("../../../common/versionUtils");
const conda_1 = require("./conda");
const condaHelper_1 = require("./condaHelper");
class CondaEnvService {
    constructor(registryLookupForConda) {
        this.registryLookupForConda = registryLookupForConda;
        this.condaHelper = new condaHelper_1.CondaHelper();
    }
    getInterpreters(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSuggestionsFromConda();
        });
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getCondaFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.registryLookupForConda) {
                return this.registryLookupForConda.getInterpreters()
                    .then(interpreters => interpreters.filter(this.isCondaEnvironment))
                    .then(condaInterpreters => this.getLatestVersion(condaInterpreters))
                    .then(condaInterpreter => {
                    return condaInterpreter ? path.join(path.dirname(condaInterpreter.path), 'conda.exe') : 'conda';
                })
                    .then((condaPath) => __awaiter(this, void 0, void 0, function* () {
                    return fs.pathExists(condaPath).then(exists => exists ? condaPath : 'conda');
                }));
            }
            return Promise.resolve('conda');
        });
    }
    isCondaEnvironment(interpreter) {
        return (interpreter.displayName ? interpreter.displayName : '').toUpperCase().indexOf('ANACONDA') >= 0 ||
            (interpreter.companyDisplayName ? interpreter.companyDisplayName : '').toUpperCase().indexOf('CONTINUUM') >= 0;
    }
    getLatestVersion(interpreters) {
        const sortedInterpreters = interpreters.filter(interpreter => interpreter.version && interpreter.version.length > 0);
        // tslint:disable-next-line:no-non-null-assertion
        sortedInterpreters.sort((a, b) => versionUtils_1.VersionUtils.compareVersion(a.version, b.version));
        if (sortedInterpreters.length > 0) {
            return sortedInterpreters[sortedInterpreters.length - 1];
        }
    }
    parseCondaInfo(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = this.condaHelper.getDisplayName(info);
            // The root of the conda environment is itself a Python interpreter
            // envs reported as e.g.: /Users/bob/miniconda3/envs/someEnv.
            const envs = Array.isArray(info.envs) ? info.envs : [];
            if (info.default_prefix && info.default_prefix.length > 0) {
                envs.push(info.default_prefix);
            }
            const promises = envs
                .map(env => {
                // If it is an environment, hence suffix with env name.
                const interpreterDisplayName = env === info.default_prefix ? displayName : `${displayName} (${path.basename(env)})`;
                // tslint:disable-next-line:no-unnecessary-local-variable
                const interpreter = {
                    path: path.join(env, ...conda_1.CONDA_RELATIVE_PY_PATH),
                    displayName: interpreterDisplayName,
                    companyDisplayName: conda_1.AnacondaCompanyName
                };
                return interpreter;
            })
                .map((env) => __awaiter(this, void 0, void 0, function* () { return fs.pathExists(env.path).then(exists => exists ? env : null); }));
            return Promise.all(promises)
                .then(interpreters => interpreters.filter(interpreter => interpreter !== null && interpreter !== undefined))
                .then(interpreters => interpreters.map(interpreter => interpreter));
        });
    }
    getSuggestionsFromConda() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getCondaFile()
                .then((condaFile) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    // interrogate conda (if it's on the path) to find all environments.
                    child_process.execFile(condaFile, ['info', '--json'], (_, stdout) => {
                        if (stdout.length === 0) {
                            resolve([]);
                            return;
                        }
                        try {
                            // tslint:disable-next-line:prefer-type-cast
                            const info = JSON.parse(stdout);
                            resolve(this.parseCondaInfo(info));
                        }
                        catch (e) {
                            // Failed because either:
                            //   1. conda is not installed.
                            //   2. `conda info --json` has changed signature.
                            //   3. output of `conda info --json` has changed in structure.
                            // In all cases, we can't offer conda pythonPath suggestions.
                            resolve([]);
                        }
                    });
                });
            }));
        });
    }
}
exports.CondaEnvService = CondaEnvService;
//# sourceMappingURL=condaEnvService.js.map