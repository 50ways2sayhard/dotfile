"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Solution for auto-formatting borrowed from the "go" language VSCode extension.
const vscode = require("vscode");
const yapfFormatter_1 = require("./../formatters/yapfFormatter");
const autoPep8Formatter_1 = require("./../formatters/autoPep8Formatter");
const dummyFormatter_1 = require("./../formatters/dummyFormatter");
const configSettings_1 = require("./../common/configSettings");
function activateFormatOnSaveProvider(languageFilter, outputChannel) {
    const formatters = new Map();
    const yapfFormatter = new yapfFormatter_1.YapfFormatter(outputChannel);
    const autoPep8 = new autoPep8Formatter_1.AutoPep8Formatter(outputChannel);
    const dummyFormatter = new dummyFormatter_1.DummyFormatter(outputChannel);
    formatters.set(yapfFormatter.Id, yapfFormatter);
    formatters.set(autoPep8.Id, autoPep8);
    formatters.set(dummyFormatter.Id, dummyFormatter);
    return vscode.workspace.onWillSaveTextDocument(e => {
        const document = e.document;
        if (document.languageId !== languageFilter.language) {
            return;
        }
        const textEditor = vscode.window.activeTextEditor;
        const editorConfig = vscode.workspace.getConfiguration('editor');
        const globalEditorFormatOnSave = editorConfig && editorConfig.has('formatOnSave') && editorConfig.get('formatOnSave') === true;
        const settings = configSettings_1.PythonSettings.getInstance(document.uri);
        if ((settings.formatting.formatOnSave || globalEditorFormatOnSave) && textEditor.document === document) {
            const formatter = formatters.get(settings.formatting.provider);
            e.waitUntil(formatter.formatDocument(document, null, null));
        }
    }, null, null);
}
exports.activateFormatOnSaveProvider = activateFormatOnSaveProvider;
//# sourceMappingURL=formatOnSaveProvider.js.map