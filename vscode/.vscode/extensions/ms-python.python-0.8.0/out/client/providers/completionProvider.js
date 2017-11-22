'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const configSettings_1 = require("../common/configSettings");
const telemetry_1 = require("../telemetry");
const constants_1 = require("../telemetry/constants");
const jediHelpers_1 = require("./jediHelpers");
const proxy = require("./jediProxy");
class PythonCompletionItemProvider {
    constructor(jediFactory) {
        this.jediFactory = jediFactory;
    }
    static parseData(data, resource) {
        if (data && data.items.length > 0) {
            return data.items.map(item => {
                const sigAndDocs = jediHelpers_1.extractSignatureAndDocumentation(item);
                const completionItem = new vscode.CompletionItem(item.text);
                completionItem.kind = item.type;
                completionItem.documentation = sigAndDocs[1].length === 0 ? item.description : sigAndDocs[1];
                completionItem.detail = sigAndDocs[0].split(/\r?\n/).join('');
                if (configSettings_1.PythonSettings.getInstance(resource).autoComplete.addBrackets === true &&
                    (item.kind === vscode.SymbolKind.Function || item.kind === vscode.SymbolKind.Method)) {
                    completionItem.insertText = new vscode_1.SnippetString(item.text).appendText('(').appendTabstop().appendText(')');
                }
                // ensure the built in memebers are at the bottom
                completionItem.sortText = (completionItem.label.startsWith('__') ? 'z' : (completionItem.label.startsWith('_') ? 'y' : '__')) + completionItem.label;
                return completionItem;
            });
        }
        return [];
    }
    provideCompletionItems(document, position, token) {
        if (position.character <= 0) {
            return Promise.resolve([]);
        }
        const filename = document.fileName;
        const lineText = document.lineAt(position.line).text;
        if (lineText.match(/^\s*\/\//)) {
            return Promise.resolve([]);
        }
        // If starts with a comment, then return
        if (lineText.trim().startsWith('#')) {
            return Promise.resolve([]);
        }
        // If starts with a """ (possible doc string), then return
        if (lineText.trim().startsWith('"""')) {
            return Promise.resolve([]);
        }
        const type = proxy.CommandType.Completions;
        const columnIndex = position.character;
        const source = document.getText();
        const cmd = {
            command: type,
            fileName: filename,
            columnIndex: columnIndex,
            lineIndex: position.line,
            source: source
        };
        return this.jediFactory.getJediProxyHandler(document.uri).sendCommand(cmd, token).then(data => {
            return PythonCompletionItemProvider.parseData(data, document.uri);
        });
    }
}
__decorate([
    telemetry_1.captureTelemetry(constants_1.COMPLETION)
], PythonCompletionItemProvider.prototype, "provideCompletionItems", null);
exports.PythonCompletionItemProvider = PythonCompletionItemProvider;
//# sourceMappingURL=completionProvider.js.map