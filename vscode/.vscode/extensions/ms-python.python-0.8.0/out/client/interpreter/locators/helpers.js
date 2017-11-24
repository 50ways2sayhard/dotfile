"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../common/utils");
const path = require("path");
const registry_1 = require("../../common/registry");
const CheckPythonInterpreterRegEx = utils_1.IS_WINDOWS ? /^python(\d+(.\d+)?)?\.exe$/ : /^python(\d+(.\d+)?)?$/;
function lookForInterpretersInDirectory(pathToCheck) {
    return utils_1.fsReaddirAsync(pathToCheck)
        .then(subDirs => subDirs.filter(fileName => CheckPythonInterpreterRegEx.test(path.basename(fileName))));
}
exports.lookForInterpretersInDirectory = lookForInterpretersInDirectory;
function fixInterpreterDisplayName(item) {
    if (!item.displayName) {
        const arch = registry_1.getArchitectureDislayName(item.architecture);
        const version = item.version || '';
        item.displayName = ['Python', version, arch].filter(item => item.length > 0).join(' ').trim();
    }
    return item;
}
exports.fixInterpreterDisplayName = fixInterpreterDisplayName;
function fixInterpreterPath(item) {
    // For some reason anaconda seems to use \\ in the registry path.
    item.path = utils_1.IS_WINDOWS ? item.path.replace(/\\\\/g, "\\") : item.path;
    item.path = utils_1.IS_WINDOWS ? item.path.replace(/\//g, "\\") : item.path;
    return item;
}
exports.fixInterpreterPath = fixInterpreterPath;
//# sourceMappingURL=helpers.js.map