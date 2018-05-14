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
const cp = require("child_process");
const util_1 = require("util");
let expandVarRegex = /\$\{(?:([^:}]+):)?([^}]+)\}/g;
function expandVariables(str, expander) {
    let result = str.replace(expandVarRegex, (all, type, key) => {
        let replacement = expander(type, key);
        return replacement != null ? replacement : all;
    });
    return result;
}
exports.expandVariables = expandVariables;
function expandVariablesInObject(obj, expander) {
    if (typeof obj == 'string' || obj instanceof String)
        return expandVariables(obj, expander);
    if (isScalarValue(obj))
        return obj;
    if (obj instanceof Array)
        return obj.map(v => expandVariablesInObject(v, expander));
    for (var prop of Object.keys(obj))
        obj[prop] = expandVariablesInObject(obj[prop], expander);
    return obj;
}
exports.expandVariablesInObject = expandVariablesInObject;
function getProcessList(currentUserOnly) {
    return __awaiter(this, void 0, void 0, function* () {
        let is_windows = process.platform == 'win32';
        var command;
        if (!is_windows) {
            if (currentUserOnly)
                command = 'ps x';
            else
                command = 'ps ax';
        }
        else {
            if (currentUserOnly)
                command = 'tasklist /V /FO CSV /FI "USERNAME eq ' + process.env['USERNAME'] + '"';
            else
                command = 'tasklist /V /FO CSV';
        }
        let stdout = yield new Promise((resolve, reject) => {
            cp.exec(command, (error, stdout, stderr) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout);
            });
        });
        let lines = stdout.split('\n');
        let items = [];
        var re, idx;
        if (!is_windows) {
            re = /^\s*(\d+)\s+.*?\s+.*?\s+.*?\s+(.*)()$/;
            idx = [1, 2, 3];
        }
        else {
            // name, pid, ..., window title
            re = /^"([^"]*)","([^"]*)",(?:"[^"]*",){6}"([^"]*)"/;
            idx = [2, 1, 3];
        }
        for (var i = 1; i < lines.length; ++i) {
            let groups = re.exec(lines[i]);
            if (groups) {
                let pid = parseInt(groups[idx[0]]);
                let name = groups[idx[1]];
                let descr = groups[idx[2]];
                let item = { label: util_1.format('%d: %s', pid, name), description: descr, pid: pid };
                items.unshift(item);
            }
        }
        return items;
    });
}
exports.getProcessList = getProcessList;
function getConfigNoDefault(config, key) {
    let x = config.inspect(key);
    var value = x.workspaceFolderValue;
    if (value === undefined)
        value = x.workspaceValue;
    if (value === undefined)
        value = x.globalValue;
    return value;
}
exports.getConfigNoDefault = getConfigNoDefault;
function isEmpty(obj) {
    if (obj === null || obj === undefined)
        return true;
    if (typeof obj == 'string' || obj instanceof String)
        return obj.length == 0;
    if (obj instanceof Array)
        return obj.length == 0;
    return Object.keys(obj).length == 0;
}
exports.isEmpty = isEmpty;
function mergeValues(value1, value2) {
    if (value2 === undefined)
        return value1;
    // For non-container types, value2 wins.
    if (isScalarValue(value1))
        return value2;
    // Concatenate arrays.
    if (value1 instanceof Array && value2 instanceof Array)
        return value1.concat(value2);
    // Merge dictionaries.
    return Object.assign({}, value1, value2);
}
exports.mergeValues = mergeValues;
function isScalarValue(value) {
    return value === null || value === undefined ||
        typeof value == 'boolean' || value instanceof Boolean ||
        typeof value == 'number' || value instanceof Number ||
        typeof value == 'string' || value instanceof String;
}
//# sourceMappingURL=util.js.map