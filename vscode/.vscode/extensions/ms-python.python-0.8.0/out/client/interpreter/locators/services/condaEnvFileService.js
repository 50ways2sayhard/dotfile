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
const fs = require("fs-extra");
const path = require("path");
const configSettings_1 = require("../../../common/configSettings");
const conda_1 = require("./conda");
class CondaEnvFileService {
    constructor(condaEnvironmentFile, versionService) {
        this.condaEnvironmentFile = condaEnvironmentFile;
        this.versionService = versionService;
    }
    getInterpreters(_) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSuggestionsFromConda();
        });
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getSuggestionsFromConda() {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.pathExists(this.condaEnvironmentFile)
                .then(exists => exists ? this.getEnvironmentsFromFile(this.condaEnvironmentFile) : Promise.resolve([]));
        });
    }
    getEnvironmentsFromFile(envFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.readFile(envFile)
                .then(buffer => buffer.toString().split(/\r?\n/g))
                .then(lines => lines.map(line => line.trim()))
                .then(lines => lines.map(line => path.join(line, ...conda_1.CONDA_RELATIVE_PY_PATH)))
                .then(interpreterPaths => interpreterPaths.map(item => fs.pathExists(item).then(exists => exists ? item : '')))
                .then(promises => Promise.all(promises))
                .then(interpreterPaths => interpreterPaths.filter(item => item.length > 0))
                .then(interpreterPaths => interpreterPaths.map(item => this.getInterpreterDetails(item)))
                .then(promises => Promise.all(promises));
        });
    }
    getInterpreterDetails(interpreter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.versionService.getVersion(interpreter, path.basename(interpreter))
                .then(version => {
                version = this.stripCompanyName(version);
                const envName = this.getEnvironmentRootDirectory(interpreter);
                // tslint:disable-next-line:no-unnecessary-local-variable
                const info = {
                    displayName: `${conda_1.AnacondaDisplayName} ${version} (${envName})`,
                    path: interpreter,
                    companyDisplayName: conda_1.AnacondaCompanyName,
                    version: version
                };
                return info;
            });
        });
    }
    stripCompanyName(content) {
        // Strip company name from version.
        const startOfCompanyName = conda_1.AnacondaCompanyNames.reduce((index, companyName) => {
            if (index > 0) {
                return index;
            }
            return content.indexOf(`:: ${companyName}`);
        }, -1);
        return startOfCompanyName > 0 ? content.substring(0, startOfCompanyName).trim() : content;
    }
    getEnvironmentRootDirectory(interpreter) {
        const envDir = interpreter.substring(0, interpreter.length - path.join(...conda_1.CONDA_RELATIVE_PY_PATH).length);
        return path.basename(envDir);
    }
}
exports.CondaEnvFileService = CondaEnvFileService;
function getEnvironmentsFile() {
    const homeDir = configSettings_1.IS_WINDOWS ? process.env.USERPROFILE : (process.env.HOME || process.env.HOMEPATH);
    return homeDir ? path.join(homeDir, '.conda', 'environments.txt') : '';
}
exports.getEnvironmentsFile = getEnvironmentsFile;
//# sourceMappingURL=condaEnvFileService.js.map