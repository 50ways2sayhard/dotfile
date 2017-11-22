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
const startup = require("./startup");
const util = require("./util");
function activate(context) {
    new Extension(context);
}
exports.activate = activate;
class ActiveDebugSession {
    constructor(adapter, debugSession) {
        this.previewContent = {};
        this.adapter = adapter;
        this.debugSession = debugSession;
    }
}
class Extension {
    constructor(context) {
        this.launching = [];
        this.activeSessions = {};
        this.previewContentChanged = new vscode_1.EventEmitter();
        this.context = context;
        let subscriptions = context.subscriptions;
        subscriptions.push(vscode_1.debug.registerDebugConfigurationProvider('lldb', this));
        subscriptions.push(vscode_1.debug.onDidStartDebugSession(this.onStartedDebugSession, this));
        subscriptions.push(vscode_1.debug.onDidTerminateDebugSession(this.onTerminatedDebugSession, this));
        subscriptions.push(vscode_1.debug.onDidReceiveDebugSessionCustomEvent(this.onDebugSessionCustomEvent, this));
        subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider('debugger', this));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.showDisassembly', this.showDisassembly, this));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.toggleDisassembly', this.toggleDisassembly, this));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.displayFormat', this.displayFormat, this));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.diagnose', startup.diagnose));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickProcess', () => this.pickProcess(false)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickMyProcess', () => this.pickProcess(true)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.getAdapterExecutable', () => startup.getAdapterExecutable(this.context)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.launchDebugServer', () => startup.launchDebugServer(this.context)));
    }
    // Invoked by VSCode to initiate a new debugging session.
    resolveDebugConfiguration(folder, config, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.context.globalState.get('lldb_works')) {
                vscode_1.window.showInformationMessage("Since this is the first time you are starting LLDB, I'm going to run some quick diagnostics...");
                let succeeded = yield startup.diagnose();
                this.context.globalState.update('lldb_works', succeeded);
                if (!succeeded) {
                    return null;
                }
            }
            try {
                if (!config.debugServer) {
                    let adapter = yield startup.startDebugAdapter(this.context);
                    this.launching.push([config.name, adapter]);
                    config.debugServer = adapter.port;
                }
                if (config._adapterStartDelay) {
                    yield new Promise(resolve => setTimeout(resolve, config._adapterStartDelay));
                }
                return config;
            }
            catch (err) {
                startup.analyzeStartupError(err);
                return null;
            }
        });
    }
    onStartedDebugSession(session) {
        if (session.type == 'lldb') {
            // VSCode does not provide a way to associate a piece of data with a DebugSession
            // being launched via vscode.startDebug, so we are saving AdapterProcess'es in
            // this.launching and then try to re-associate them with correct DebugSessions
            // once we get this notification. >:-(
            for (var i = 0; i < this.launching.length; ++i) {
                let [name, adapter] = this.launching[i];
                if (session.name == name) {
                    this.activeSessions[session.id] = new ActiveDebugSession(adapter, session);
                    this.launching.splice(i, 1);
                    return;
                }
                // Clean out entries that became stale for some reason.
                if (!adapter.isAlive) {
                    this.launching.splice(i--, 1);
                }
            }
        }
    }
    onTerminatedDebugSession(session) {
        if (session.type == 'lldb') {
            let activeSession = this.activeSessions[session.id];
            if (activeSession) {
                // Adapter should exit automatically when VSCode disconnects, but in case it
                // doesn't, we kill it (after giving a bit of time to shut down gracefully).
                setTimeout(activeSession.adapter.terminate, 1500);
            }
            delete this.activeSessions[session.id];
        }
    }
    onDebugSessionCustomEvent(e) {
        if (e.session.type == 'lldb') {
            if (e.event = 'displayHtml') {
                this.onDisplayHtml(e.session.id, e.body);
            }
        }
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
            let items = util.getProcessList(currentUserOnly);
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
    normalizeUri(uri, sessionId) {
        if (uri.scheme && uri.scheme != 'debugger')
            return uri; // Pass through non-debugger URIs.
        return uri.with({ scheme: 'debugger', authority: sessionId });
    }
    onDisplayHtml(sessionId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var documentUri = this.normalizeUri(vscode_1.Uri.parse(body.uri), sessionId);
            for (var key in body.content) {
                var contentUri = this.normalizeUri(vscode_1.Uri.parse(key), sessionId);
                let content = body.content[key];
                if (content != null) {
                    this.activeSessions[sessionId].previewContent[contentUri.toString()] = content;
                }
                else {
                    delete this.activeSessions[sessionId].previewContent[contentUri.toString()];
                }
                if (contentUri.toString() != documentUri.toString()) {
                    this.previewContentChanged.fire(contentUri);
                }
            }
            this.previewContentChanged.fire(documentUri);
            yield vscode_1.commands.executeCommand('vscode.previewHtml', documentUri.toString(), body.position, body.title, { allowScripts: true, allowSvgs: true });
        });
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri.scheme != 'debugger')
                return null; // Should not happen, as we've only registered for 'debugger'.
            let activeSession = this.activeSessions[uri.authority];
            if (!activeSession) {
                console.error('provideTextDocumentContent: Did not find an active debug session for %s', uri.toString());
                return null;
            }
            let uriString = uri.toString();
            if (activeSession.previewContent.hasOwnProperty(uriString)) {
                return activeSession.previewContent[uriString];
            }
            let result = yield activeSession.debugSession.customRequest('provideContent', { uri: uriString });
            return result.content;
        });
    }
    get onDidChange() {
        return this.previewContentChanged.event;
    }
}
;
//# sourceMappingURL=extension.js.map