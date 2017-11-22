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
const vscode_1 = require("vscode");
const util_1 = require("util");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const ver = require("./ver");
const util = require("./util");
let output = vscode_1.window.createOutputChannel('LLDB');
class AdapterProcess {
    constructor(process) {
        this.process = process;
        this.isAlive = true;
        process.on('exit', (code, signal) => {
            this.isAlive = false;
            if (signal) {
                output.appendLine(util_1.format('Adapter teminated by %s signal.', signal));
            }
            if (code) {
                output.appendLine(util_1.format('Adapter exit code: %d.', code));
            }
        });
    }
    terminate() {
        if (this.isAlive) {
            this.process.kill();
        }
    }
}
exports.AdapterProcess = AdapterProcess;
// Start debug adapter in TCP session mode and return the port number it is listening on.
function startDebugAdapter(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let adapterPath = path.join(context.extensionPath, 'adapter');
        let params = getAdapterParameters();
        let args = ['-b', '-Q',
            '-O', util_1.format('command script import \'%s\'', adapterPath),
            '-O', util_1.format('script adapter.main.run_tcp_session(0, \'%s\')', params)
        ];
        let lldb = spawnDebugger(args);
        let regex = new RegExp('^Listening on port (\\d+)\\s', 'm');
        let match = yield waitPattern(lldb, regex);
        let adapter = new AdapterProcess(lldb);
        adapter.port = parseInt(match[1]);
        return adapter;
    });
}
exports.startDebugAdapter = startDebugAdapter;
function getAdapterParameters() {
    let config = vscode_1.workspace.getConfiguration('lldb');
    let params = config.get('parameters');
    return new Buffer(JSON.stringify(params)).toString('base64');
}
var DiagnosticsStatus;
(function (DiagnosticsStatus) {
    DiagnosticsStatus[DiagnosticsStatus["Succeeded"] = 0] = "Succeeded";
    DiagnosticsStatus[DiagnosticsStatus["Warning"] = 1] = "Warning";
    DiagnosticsStatus[DiagnosticsStatus["Failed"] = 2] = "Failed";
})(DiagnosticsStatus || (DiagnosticsStatus = {}));
function diagnose() {
    return __awaiter(this, void 0, void 0, function* () {
        let args = ['-b', '-Q',
            '-O', 'script import sys, io, lldb; ' +
                'print(lldb.SBDebugger.Create().GetVersionString()); ' +
                'print("OK")'
        ];
        var status = null;
        try {
            let lldb = spawnDebugger(args);
            var versionPattern = '^lldb version ([0-9.]+)';
            var desiredVersion = '3.9.1';
            if (process.platform.search('win32') != -1) {
                desiredVersion = '4.0.0';
            }
            else if (process.platform.search('darwin') != -1) {
                versionPattern = '^lldb-([0-9.]+)';
                desiredVersion = '360.1.68';
            }
            let pattern = new RegExp('(?:' + versionPattern + '[^]*)?^OK$', 'm');
            let match = yield waitPattern(lldb, pattern);
            status = DiagnosticsStatus.Succeeded;
            let version = match[1];
            if (version && ver.lt(version, desiredVersion)) {
                output.appendLine(util_1.format('The version of your LLDB has been detected as %s. ' +
                    'For best results please consider upgrading to least %s.', version, desiredVersion));
                status = DiagnosticsStatus.Warning;
            }
            if (process.platform.indexOf('linux') >= 0) {
                status = Math.max(status, checkPTraceScope());
            }
        }
        catch (err) {
            output.appendLine('---');
            output.appendLine(util_1.format('An exception was raised while launching debugger: %s', util_1.inspect(err)));
            status = DiagnosticsStatus.Failed;
        }
        output.show(true);
        switch (status) {
            case DiagnosticsStatus.Succeeded:
                vscode_1.window.showInformationMessage('LLDB self-test completed successfuly.');
                break;
            case DiagnosticsStatus.Warning:
                vscode_1.window.showWarningMessage('LLDB self-test completed with warnings.  Please check LLDB output panel for details.');
                break;
            case DiagnosticsStatus.Failed:
                vscode_1.window.showInformationMessage('LLDB self-test FAILED.');
                break;
        }
        return status != DiagnosticsStatus.Failed;
    });
}
exports.diagnose = diagnose;
function checkPTraceScope() {
    let ptraceScopePath = '/proc/sys/kernel/yama/ptrace_scope';
    try {
        let ptraceScope = fs.readFileSync(ptraceScopePath).toString('ascii');
        output.appendLine('The value of \'' + ptraceScopePath + '\' is: ' + ptraceScope);
        let moreInfo = 'For more information see: https://en.wikipedia.org/wiki/Ptrace, https://www.kernel.org/doc/Documentation/security/Yama.txt';
        switch (parseInt(ptraceScope)) {
            case 0:
                return DiagnosticsStatus.Succeeded;
            case 1:
                output.appendLine('Warning: Your system configuration restricts process attach to child processes only.');
                output.appendLine(moreInfo);
                return DiagnosticsStatus.Succeeded; // This is a fairly typical setting, let's not annoy user with warnings.
            case 2:
                output.appendLine('Warning: Your system configuration restricts debugging to privileged processes only.');
                output.appendLine(moreInfo);
                return DiagnosticsStatus.Warning;
            case 3:
                output.appendLine('Warning: Your system configuration has disabled debugging.');
                output.appendLine(moreInfo);
                return DiagnosticsStatus.Warning;
            default:
                output.appendLine('Warning: Unknown value of ptrace_scope.');
                output.appendLine(moreInfo);
                return DiagnosticsStatus.Warning;
        }
    }
    catch (err) {
        output.appendLine('Couldn\'t read ' + ptraceScopePath + ' : ' + err.message);
        return DiagnosticsStatus.Succeeded; // Ignore
    }
}
// Spawn LLDB with the specified arguments, wait for it to output something matching
// regex pattern, or until the timeout expires.
function spawnDebugger(args) {
    output.clear();
    let config = vscode_1.workspace.getConfiguration('lldb');
    let lldbPath = config.get('executable', 'lldb');
    let lldbEnv = config.get('environment', {});
    let env = Object.assign({}, process.env);
    for (var key in lldbEnv) {
        env[key] = util.expandVariables(lldbEnv[key], (type, key) => {
            if (type == 'env')
                return process.env[key];
            throw new Error('Unknown variable type ' + type);
        });
    }
    let options = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env,
        cwd: vscode_1.workspace.rootPath
    };
    if (process.platform.search('darwin') != -1) {
        // Make sure LLDB finds system Python before Brew Python
        // https://github.com/Homebrew/legacy-homebrew/issues/47201
        options.env['PATH'] = '/usr/bin:' + process.env['PATH'];
    }
    return cp.spawn(lldbPath, args, options);
}
function waitPattern(lldb, pattern, timeout_millis = 5000) {
    return new Promise((resolve, reject) => {
        var promisePending = true;
        var adapterOutput = '';
        // Wait for expected pattern in stdout.
        lldb.stdout.on('data', (chunk) => {
            let chunkStr = chunk.toString();
            output.append(chunkStr); // Send to "LLDB" output pane.
            if (promisePending) {
                adapterOutput += chunkStr;
                let match = pattern.exec(adapterOutput);
                if (match) {
                    clearTimeout(timer);
                    adapterOutput = null;
                    promisePending = false;
                    resolve(match);
                }
            }
        });
        // Send sdterr to the output pane as well.
        lldb.stderr.on('data', (chunk) => {
            let chunkStr = chunk.toString();
            output.append(chunkStr);
        });
        // On spawn error.
        lldb.on('error', (err) => {
            promisePending = false;
            reject(err);
        });
        // Bail if LLDB does not start within the specified timeout.
        let timer = setTimeout(() => {
            if (promisePending) {
                lldb.kill();
                let err = Error('The debugger did not start within the allotted time.');
                err.code = 'Timeout';
                err.stdout = adapterOutput;
                promisePending = false;
                reject(err);
            }
        }, timeout_millis);
        // Premature exit.
        lldb.on('exit', (code, signal) => {
            if (promisePending) {
                let err = Error('The debugger exited without completing startup handshake.');
                err.code = 'Handshake';
                err.stdout = adapterOutput;
                promisePending = false;
                reject(err);
            }
        });
    });
}
function analyzeStartupError(err) {
    return __awaiter(this, void 0, void 0, function* () {
        output.appendLine(err.toString());
        output.show(true);
        let e = err;
        let diagnostics = 'Run diagnostics';
        var actionAsync;
        if (e.code == 'ENOENT') {
            actionAsync = vscode_1.window.showErrorMessage(util_1.format('Could not start debugging because executable \'%s\' was not found.', e.path), diagnostics);
        }
        else if (e.code == 'Timeout' || e.code == 'Handshake') {
            actionAsync = vscode_1.window.showErrorMessage(err.message, diagnostics);
        }
        else {
            actionAsync = vscode_1.window.showErrorMessage('Could not start debugging.', diagnostics);
        }
        if ((yield actionAsync) == diagnostics) {
            yield diagnose();
        }
    });
}
exports.analyzeStartupError = analyzeStartupError;
function getAdapterExecutable(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = vscode_1.workspace.getConfiguration('lldb');
        let lldbPath = config.get('executable', 'lldb');
        let adapterPath = path.join(context.extensionPath, 'adapter');
        let params = getAdapterParameters();
        return {
            command: lldbPath,
            args: ['-b', '-Q',
                '-O', util_1.format('command script import \'%s\'', adapterPath),
                '-O', util_1.format('script adapter.main.run_stdio_session(\'%s\')', params)
            ]
        };
    });
}
exports.getAdapterExecutable = getAdapterExecutable;
function launchDebugServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = vscode_1.workspace.getConfiguration('lldb');
        let lldbPath = config.get('executable', 'lldb');
        let terminal = vscode_1.window.createTerminal('LLDB Debug Server');
        let adapterPath = path.join(context.extensionPath, 'adapter');
        let command = util_1.format('%s -b -O "command script import \'%s\'" ', lldbPath, adapterPath) +
            util_1.format('-O "script adapter.main.run_tcp_server()"\n');
        terminal.sendText(command);
        terminal.show(true);
    });
}
exports.launchDebugServer = launchDebugServer;
//# sourceMappingURL=startup.js.map