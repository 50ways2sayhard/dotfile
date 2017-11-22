"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Registry = require("winreg");
var RegistryArchitectures;
(function (RegistryArchitectures) {
    RegistryArchitectures["x86"] = "x86";
    RegistryArchitectures["x64"] = "x64";
})(RegistryArchitectures || (RegistryArchitectures = {}));
var Architecture;
(function (Architecture) {
    Architecture[Architecture["Unknown"] = 1] = "Unknown";
    Architecture[Architecture["x86"] = 2] = "x86";
    Architecture[Architecture["x64"] = 3] = "x64";
})(Architecture = exports.Architecture || (exports.Architecture = {}));
var Hive;
(function (Hive) {
    Hive[Hive["HKCU"] = 0] = "HKCU";
    Hive[Hive["HKLM"] = 1] = "HKLM";
})(Hive = exports.Hive || (exports.Hive = {}));
class RegistryImplementation {
    getKeys(key, hive, arch) {
        return getRegistryKeys({ hive: translateHive(hive), arch: translateArchitecture(arch), key });
    }
    getValue(key, hive, arch, name = '') {
        return getRegistryValue({ hive: translateHive(hive), arch: translateArchitecture(arch), key }, name);
    }
}
exports.RegistryImplementation = RegistryImplementation;
function getArchitectureDislayName(arch) {
    switch (arch) {
        case Architecture.x64:
            return '64-bit';
        case Architecture.x86:
            return '32-bit';
        default:
            return '';
    }
}
exports.getArchitectureDislayName = getArchitectureDislayName;
function getRegistryValue(options, name = '') {
    return new Promise((resolve, reject) => {
        new Registry(options).get(name, (error, result) => {
            if (error) {
                return resolve(undefined);
            }
            resolve(result.value);
        });
    });
}
function getRegistryKeys(options) {
    // https://github.com/python/peps/blob/master/pep-0514.txt#L85
    return new Promise((resolve, reject) => {
        new Registry(options).keys((error, result) => {
            if (error) {
                return resolve([]);
            }
            resolve(result.map(item => item.key));
        });
    });
}
function translateArchitecture(arch) {
    switch (arch) {
        case Architecture.x86:
            return RegistryArchitectures.x86;
        case Architecture.x64:
            return RegistryArchitectures.x64;
        default:
            return;
    }
}
function translateHive(hive) {
    switch (hive) {
        case Hive.HKCU:
            return Registry.HKCU;
        case Hive.HKLM:
            return Registry.HKLM;
        default:
            return;
    }
}
//# sourceMappingURL=registry.js.map