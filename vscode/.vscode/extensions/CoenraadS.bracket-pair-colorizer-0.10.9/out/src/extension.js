"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const documentDecorationManager_1 = require("./documentDecorationManager");
function activate(context) {
    const documentDecorationManager = new documentDecorationManager_1.default();
    vscode.workspace.onDidChangeConfiguration((event) => {
        documentDecorationManager.reset();
    }, null, context.subscriptions);
    vscode.window.onDidChangeVisibleTextEditors(() => {
        documentDecorationManager.updateAllDocuments();
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument((event) => {
        documentDecorationManager.onDidChangeTextDocument(event.document, event.contentChanges);
    }, null, context.subscriptions);
    // vscode.window.onDidChangeTextEditorSelection((event) => {
    //     documentDecorationManager.onDidChangeSelection(event);
    // }, null, context.subscriptions);
    vscode.workspace.onDidCloseTextDocument((event) => {
        documentDecorationManager.onDidCloseTextDocument(event);
    }, null, context.subscriptions);
    documentDecorationManager.reset();
}
exports.activate = activate;
// tslint:disable-next-line:no-empty
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map