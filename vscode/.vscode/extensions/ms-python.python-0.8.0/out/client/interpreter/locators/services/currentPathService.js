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
const _ = require("lodash");
const path = require("path");
const configSettings_1 = require("../../../common/configSettings");
const helpers_1 = require("../../helpers");
class CurrentPathService {
    constructor(virtualEnvMgr, versionProvider) {
        this.virtualEnvMgr = virtualEnvMgr;
        this.versionProvider = versionProvider;
    }
    getInterpreters(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.suggestionsFromKnownPaths();
        });
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    suggestionsFromKnownPaths(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentPythonInterpreter = this.getInterpreter(configSettings_1.PythonSettings.getInstance(resource).pythonPath, '').then(interpreter => [interpreter]);
            const python = this.getInterpreter('python', '').then(interpreter => [interpreter]);
            const python2 = this.getInterpreter('python2', '').then(interpreter => [interpreter]);
            const python3 = this.getInterpreter('python3', '').then(interpreter => [interpreter]);
            return Promise.all([currentPythonInterpreter, python, python2, python3])
                .then(listOfInterpreters => _.flatten(listOfInterpreters))
                .then(interpreters => interpreters.filter(item => item.length > 0))
                .then(interpreters => Promise.all(interpreters.map(interpreter => this.getInterpreterDetails(interpreter))));
        });
    }
    getInterpreterDetails(interpreter) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                this.versionProvider.getVersion(interpreter, path.basename(interpreter)),
                this.virtualEnvMgr.detect(interpreter)
            ])
                .then(([displayName, virtualEnv]) => {
                displayName += virtualEnv ? ` (${virtualEnv.name})` : '';
                return {
                    displayName,
                    path: interpreter
                };
            });
        });
    }
    getInterpreter(pythonPath, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                // tslint:disable-next-line:variable-name
                child_process.execFile(pythonPath, ['-c', 'import sys;print(sys.executable)'], (_err, stdout) => {
                    resolve(helpers_1.getFirstNonEmptyLineFromMultilineString(stdout));
                });
            })
                .then(value => value.length === 0 ? defaultValue : value);
        });
    }
}
exports.CurrentPathService = CurrentPathService;
//# sourceMappingURL=currentPathService.js.map