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
const cp = require("child_process");
const util_1 = require("util");
const startup = require("./startup");
function activate(context) {
    new Extension(context);
}
exports.activate = activate;
class Extension {
    constructor(context) {
        this.launching = [];
        this.activeSessions = {};
        this.previewContent = {};
        this.previewContentChanged = new vscode_1.EventEmitter();
        this.context = context;
        let subscriptions = context.subscriptions;
        subscriptions.push(vscode_1.commands.registerCommand('lldb.getAdapterExecutable', () => startup.getAdapterExecutable(this.context)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.startDebugSession', (args) => this.startDebugSession(args)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.showDisassembly', () => this.showDisassembly()));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.toggleDisassembly', () => this.toggleDisassembly()));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.displayFormat', () => this.displayFormat()));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.launchDebugServer', () => startup.launchDebugServer(this.context)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.diagnose', () => startup.diagnose()));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickProcess', () => this.pickProcess(false)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickMyProcess', () => this.pickProcess(true)));
        let extension = this;
        subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider('debugger', {
            get onDidChange() {
                return extension.previewContentChanged.event;
            },
            provideTextDocumentContent(uri) {
                return __awaiter(this, void 0, void 0, function* () {
                    return extension.provideHtmlContent(uri);
                });
            }
        }));
        subscriptions.push(vscode_1.debug.onDidStartDebugSession(session => {
            if (session.type == 'lldb') {
                // VSCode does not provide a way to associate a piece of data with a DebugSession
                // being launched via vscode.startDebug, so we are saving AdapterProcess'es in
                // this.launching and then try to re-associate them with correct DebugSessions
                // once we get this notification. >:-(
                for (var i = 0; i < this.launching.length; ++i) {
                    let [name, adapter] = this.launching[i];
                    if (session.name == name) {
                        this.activeSessions[session.id] = adapter;
                        this.launching.splice(i, 1);
                        return;
                    }
                    // Clean out entries that became stale for some reason.
                    if (!adapter.isAlive) {
                        this.launching.splice(i--, 1);
                    }
                }
            }
        }, this));
        subscriptions.push(vscode_1.debug.onDidTerminateDebugSession(session => {
            if (session.type == 'lldb') {
                let adapter = this.activeSessions[session.id];
                if (adapter) {
                    // Adapter should exit automatically when VSCode disconnects, but in case it
                    // doesn't, we kill it (after giving a bit of time to shut down gracefully).
                    setTimeout(adapter.terminate, 1500);
                }
                delete this.activeSessions[session.id];
            }
        }, this));
        subscriptions.push(vscode_1.debug.onDidReceiveDebugSessionCustomEvent(e => {
            if (e.session.type == 'lldb') {
                if (e.event = 'displayHtml') {
                    this.onDisplayHtml(e.body);
                }
            }
        }, this));
    }
    // Invoked by VSCode to initiate a new debugging session.
    startDebugSession(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.context.globalState.get('lldb_works')) {
                vscode_1.window.showInformationMessage("Since this is the first time you are starting LLDB, I'm going to run some quick diagnostics...");
                let succeeded = yield startup.diagnose();
                this.context.globalState.update('lldb_works', succeeded);
                if (!succeeded)
                    return;
            }
            try {
                if (!config.debugServer) {
                    let adapter = yield startup.startDebugAdapter(this.context);
                    this.launching.push([config.name, adapter]);
                    config.debugServer = adapter.port;
                }
                yield vscode_1.commands.executeCommand('vscode.startDebug', config);
            }
            catch (err) {
                startup.analyzeStartupError(err);
            }
        });
    }
    showDisassembly() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode_1.debug.activeDebugSession && vscode_1.debug.activeDebugSession.type == 'lldb') {
                let selection = yield vscode_1.window.showQuickPick(['always', 'auto', 'never']);
                vscode_1.debug.activeDebugSession.customRequest('showDisassembly', { value: selection });
            }
        });
    }
    toggleDisassembly() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode_1.debug.activeDebugSession && vscode_1.debug.activeDebugSession.type == 'lldb') {
                vscode_1.debug.activeDebugSession.customRequest('showDisassembly', { value: 'toggle' });
            }
        });
    }
    displayFormat() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode_1.debug.activeDebugSession && vscode_1.debug.activeDebugSession.type == 'lldb') {
                let selection = yield vscode_1.window.showQuickPick(['auto', 'hex', 'decimal', 'binary']);
                vscode_1.debug.activeDebugSession.customRequest('displayFormat', { value: selection });
            }
        });
    }
    pickProcess(currentUserOnly) {
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
            let item = yield vscode_1.window.showQuickPick(items);
            if (item) {
                return item.pid;
            }
            else {
                throw Error('Cancelled');
            }
        });
    }
    /// HTML display stuff ///
    onDisplayHtml(body) {
        return __awaiter(this, void 0, void 0, function* () {
            this.previewContent = body.content;
            for (var keyUri in body.content) {
                this.previewContentChanged.fire(vscode_1.Uri.parse(keyUri));
            }
            yield vscode_1.commands.executeCommand('vscode.previewHtml', body.uri, body.position, body.title, { allowScripts: true, allowSvgs: true });
        });
    }
    provideHtmlContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let uriString = uri.toString();
            if (this.previewContent.hasOwnProperty(uriString)) {
                return this.previewContent[uriString];
            }
            let result = yield vscode_1.commands.executeCommand('workbench.customDebugRequest', 'provideContent', { uri: uriString });
            if (result === undefined) {
                return "Not available";
            }
            else {
                return result.body.content;
            }
        });
    }
}
;
//# sourceMappingURL=extension.js.map