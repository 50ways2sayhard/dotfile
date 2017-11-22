'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const configSettings_1 = require("../common/configSettings");
const installer_1 = require("../common/installer");
const utils_1 = require("./../common/utils");
const main_1 = require("./errorHandlers/main");
// tslint:disable-next-line:variable-name
let NamedRegexp = null;
const REGEX = '(?<line>\\d+),(?<column>\\d+),(?<type>\\w+),(?<code>\\w\\d+):(?<message>.*)\\r?(\\n|$)';
var LintMessageSeverity;
(function (LintMessageSeverity) {
    LintMessageSeverity[LintMessageSeverity["Hint"] = 0] = "Hint";
    LintMessageSeverity[LintMessageSeverity["Error"] = 1] = "Error";
    LintMessageSeverity[LintMessageSeverity["Warning"] = 2] = "Warning";
    LintMessageSeverity[LintMessageSeverity["Information"] = 3] = "Information";
})(LintMessageSeverity = exports.LintMessageSeverity || (exports.LintMessageSeverity = {}));
function matchNamedRegEx(data, regex) {
    if (NamedRegexp === null) {
        // tslint:disable-next-line:no-require-imports
        NamedRegexp = require('named-js-regexp');
    }
    const compiledRegexp = NamedRegexp(regex, 'g');
    const rawMatch = compiledRegexp.exec(data);
    if (rawMatch !== null) {
        return rawMatch.groups();
    }
    return null;
}
exports.matchNamedRegEx = matchNamedRegEx;
class BaseLinter {
    constructor(id, product, outputChannel) {
        this.product = product;
        this.outputChannel = outputChannel;
        // tslint:disable-next-line:variable-name
        this._columnOffset = 0;
        this.Id = id;
        this._errorHandler = new main_1.ErrorHandler(this.Id, product, new installer_1.Installer(), this.outputChannel);
    }
    get pythonSettings() {
        return this._pythonSettings;
    }
    isEnabled(resource) {
        this._pythonSettings = configSettings_1.PythonSettings.getInstance(resource);
        const enabledSetting = `${this.Id}Enabled`;
        // tslint:disable-next-line:prefer-type-cast
        return this._pythonSettings.linting[enabledSetting];
    }
    linterArgs(resource) {
        this._pythonSettings = configSettings_1.PythonSettings.getInstance(resource);
        const argsSetting = `${this.Id}Args`;
        // tslint:disable-next-line:prefer-type-cast
        return this._pythonSettings.linting[argsSetting];
    }
    isLinterExecutableSpecified(resource) {
        this._pythonSettings = configSettings_1.PythonSettings.getInstance(resource);
        const argsSetting = `${this.Id}Path`;
        // tslint:disable-next-line:prefer-type-cast
        const executablePath = this._pythonSettings.linting[argsSetting];
        return path.basename(executablePath).length > 0 && path.basename(executablePath) !== executablePath;
    }
    lint(document, cancellation) {
        this._pythonSettings = configSettings_1.PythonSettings.getInstance(document.uri);
        return this.runLinter(document, cancellation);
    }
    getWorkspaceRootPath(document) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        const workspaceRootPath = (workspaceFolder && typeof workspaceFolder.uri.fsPath === 'string') ? workspaceFolder.uri.fsPath : undefined;
        return typeof workspaceRootPath === 'string' ? workspaceRootPath : __dirname;
    }
    // tslint:disable-next-line:no-any
    parseMessagesSeverity(error, categorySeverity) {
        if (categorySeverity[error]) {
            const severityName = categorySeverity[error];
            switch (severityName) {
                case 'Error':
                    return LintMessageSeverity.Error;
                case 'Hint':
                    return LintMessageSeverity.Hint;
                case 'Information':
                    return LintMessageSeverity.Information;
                case 'Warning':
                    return LintMessageSeverity.Warning;
                default: {
                    if (LintMessageSeverity[severityName]) {
                        // tslint:disable-next-line:no-any
                        return LintMessageSeverity[severityName];
                    }
                }
            }
        }
        return LintMessageSeverity.Information;
    }
    run(command, args, document, cwd, cancellation, regEx = REGEX) {
        return utils_1.execPythonFile(document.uri, command, args, cwd, true, null, cancellation).then(data => {
            if (!data) {
                data = '';
            }
            this.displayLinterResultHeader(data);
            const outputLines = data.split(/\r?\n/g);
            return this.parseLines(outputLines, regEx);
        }).catch(error => {
            this.handleError(this.Id, command, error, document.uri);
            return [];
        });
    }
    handleError(expectedFileName, fileName, error, resource) {
        this._errorHandler.handleError(expectedFileName, fileName, error, resource);
    }
    parseLine(line, regEx) {
        const match = matchNamedRegEx(line, regEx);
        if (!match) {
            return;
        }
        // tslint:disable-next-line:no-any
        match.line = Number(match.line);
        // tslint:disable-next-line:no-any
        match.column = Number(match.column);
        return {
            code: match.code,
            message: match.message,
            column: isNaN(match.column) || match.column === 0 ? 0 : match.column - this._columnOffset,
            line: match.line,
            type: match.type,
            provider: this.Id
        };
    }
    parseLines(outputLines, regEx) {
        const diagnostics = [];
        outputLines.filter((value, index) => index <= this.pythonSettings.linting.maxNumberOfProblems).forEach(line => {
            try {
                const msg = this.parseLine(line, regEx);
                if (msg) {
                    diagnostics.push(msg);
                }
            }
            catch (ex) {
                // Hmm, need to handle this later
                // TODO:
            }
        });
        return diagnostics;
    }
    displayLinterResultHeader(data) {
        this.outputChannel.append(`${'#'.repeat(10)}Linting Output - ${this.Id}${'#'.repeat(10)}\n`);
        this.outputChannel.append(data);
    }
}
exports.BaseLinter = BaseLinter;
//# sourceMappingURL=baseLinter.js.map