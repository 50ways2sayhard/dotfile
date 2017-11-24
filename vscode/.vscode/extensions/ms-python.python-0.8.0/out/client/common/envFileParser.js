"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function parseEnvFile(envFile) {
    const buffer = fs.readFileSync(envFile, 'utf8');
    const env = {};
    buffer.split('\n').forEach(line => {
        const r = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
        if (r !== null) {
            let value = r[2] || '';
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.replace(/\\n/gm, '\n');
            }
            env[r[1]] = value.replace(/(^['"]|['"]$)/g, '');
        }
    });
    return mergeEnvVariables(env);
}
exports.parseEnvFile = parseEnvFile;
function mergeEnvVariables(newVariables, mergeWith = process.env) {
    for (let setting in mergeWith) {
        if (setting === 'PYTHONPATH') {
            let PYTHONPATH = newVariables['PYTHONPATH'];
            if (typeof PYTHONPATH !== 'string') {
                PYTHONPATH = '';
            }
            if (mergeWith['PYTHONPATH']) {
                PYTHONPATH += (PYTHONPATH.length > 0 ? path.delimiter : '') + mergeWith['PYTHONPATH'];
            }
            if (PYTHONPATH.length > 0) {
                newVariables[setting] = PYTHONPATH;
            }
            continue;
        }
        if (!newVariables[setting]) {
            newVariables[setting] = mergeWith[setting];
        }
    }
    return newVariables;
}
exports.mergeEnvVariables = mergeEnvVariables;
//# sourceMappingURL=envFileParser.js.map