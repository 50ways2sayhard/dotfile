"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const inline_input_1 = require("./inline-input");
const decoration_model_1 = require("./decoration-model");
const decoration_1 = require("./decoration");
const viewport_1 = require("../lib/viewport");
const vscode = require("vscode");
class Selection {
}
Selection.Empty = new Selection();
class MetaJumper {
    constructor(context, config) {
        this.decorationModelBuilder = new decoration_model_1.DecorationModelBuilder();
        this.decorator = new decoration_1.Decorator();
        this.isJumping = false;
        this.currentFindIndex = -1;
        this.updateConfig = () => {
            this.decorator.initialize(this.config);
        };
        this.jump = (jumped) => {
            return new Promise((resolve, reject) => {
                let editor = vscode.window.activeTextEditor;
                if (!editor) {
                    reject();
                    return;
                }
                let msg = this.isSelectionMode ? "metaGo: Type to Select" : "metaGo: Type To Jump";
                let messageDisposable = vscode.window.setStatusBarMessage(msg);
                const promise = new Promise((resolve, reject) => {
                    this.decorator.addCommandIndicator(editor);
                    return this.getFirstInput(editor, resolve, reject);
                })
                    .then((model) => {
                    jumped(editor, model);
                    let msg = this.isSelectionMode ? 'metaGo: Selected!' : 'metaGo: Jumped!';
                    vscode.window.setStatusBarMessage(msg, 2000);
                    resolve();
                })
                    .catch((reason) => {
                    this.decorator.removeCommandIndicator(editor);
                    if (!reason)
                        reason = "Canceled!";
                    vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 2000);
                    messageDisposable.dispose();
                    reject();
                });
            });
        };
        this.getFirstInput = (editor, resolve, reject) => {
            let firstInlineInput = new inline_input_1.InlineInput()
                .show(editor, (v) => {
                this.decorator.removeCommandIndicator(editor);
                return v;
            })
                .then((value) => {
                if (!value) {
                    reject();
                    return;
                }
                ;
                if (value === ' ' && this.currentFindIndex !== Number.NaN && this.decorationModels) {
                    let model = this.decorationModels.find((model) => model.indexInModels === (this.currentFindIndex + 1));
                    if (model) {
                        resolve(model);
                        this.currentFindIndex++;
                        return;
                    }
                    reject();
                    return;
                }
                else if (value === '\n' && this.currentFindIndex !== Number.NaN && this.decorationModels) {
                    let model = this.decorationModels.find((model) => model.indexInModels === (this.currentFindIndex - 1));
                    if (model) {
                        resolve(model);
                        this.currentFindIndex--;
                    }
                    reject();
                    return;
                }
                if (value && value.length > 1)
                    value = value.substring(0, 1);
                this.getSelection(editor)
                    .then((selection) => {
                    let lineCharIndexes = this.find(editor, selection.before, selection.after, value);
                    if (lineCharIndexes.count <= 0) {
                        reject("metaGo: no matches");
                        return;
                    }
                    this.decorationModels = this.decorationModelBuilder.buildDecorationModel(lineCharIndexes);
                    if (this.decorationModels.length === 0) {
                        reject("metaGo: encoding error");
                        return;
                    }
                    if (this.decorationModels.length === 1) {
                        resolve(this.decorationModels[0]);
                    }
                    else {
                        this.prepareForJumpTo(editor, this.decorationModels).then((model) => {
                            resolve(model);
                        }).catch((e) => {
                            reject(e);
                        });
                    }
                })
                    .catch((e) => reject(e));
            })
                .catch((e) => {
                reject(e);
            });
            return firstInlineInput;
        };
        this.find = (editor, selectionBefore, selectionAfter, value) => {
            let lineIndexes = {
                count: 0,
                focusLine: 0,
                indexes: {}
            };
            for (let i = selectionBefore.startLine; i < selectionBefore.lastLine; i++) {
                let line = editor.document.lineAt(i);
                let indexes = this.indexesOf(line.text, value);
                lineIndexes.count += indexes.length;
                lineIndexes.indexes[i] = indexes;
            }
            lineIndexes.focusLine = editor.selection.active.line;
            for (let i = selectionAfter.startLine; i < selectionAfter.lastLine; i++) {
                let line = editor.document.lineAt(i);
                let indexes = this.indexesOf(line.text, value);
                lineIndexes.count += indexes.length;
                lineIndexes.indexes[i] = indexes;
            }
            return lineIndexes;
        };
        this.indexesOf = (str, char) => {
            if (char && char.length === 0) {
                return [];
            }
            let indices = [];
            let ignoreCase = this.config.jumper.targetIgnoreCase;
            if (this.config.jumper.findAllMode === 'on') {
                for (var i = 0; i < str.length; i++) {
                    if (!ignoreCase) {
                        if (str[i] === char) {
                            let adj = this.inteliAdjBefore(str, char, i);
                            indices.push(new decoration_model_1.CharIndex(i, adj));
                        }
                        ;
                    }
                    else {
                        if (str[i] && str[i].toLowerCase() === char.toLowerCase()) {
                            let adj = this.inteliAdjBefore(str, char, i);
                            indices.push(new decoration_model_1.CharIndex(i, adj));
                        }
                    }
                }
            }
            else {
                //splitted by spaces
                let words = str.split(new RegExp(this.config.jumper.wordSeparatorPattern));
                //current line index
                let index = 0;
                for (var i = 0; i < words.length; i++) {
                    if (!ignoreCase) {
                        if (words[i][0] === char) {
                            indices.push(new decoration_model_1.CharIndex(index));
                        }
                    }
                    else {
                        if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                            let adj = this.inteliAdjBefore(str, char, i);
                            indices.push(new decoration_model_1.CharIndex(index, adj));
                        }
                    }
                    // increment by word and white space
                    index += words[i].length + 1;
                }
            }
            return indices;
        };
        this.prepareForJumpTo = (editor, models) => {
            return new Promise((resolve, reject) => {
                this.decorator.addDecorations(editor, models);
                let msg = this.isSelectionMode ? "metaGo: Select To" : "metaGo: Jump To";
                let messageDisposable = vscode.window.setStatusBarMessage(msg);
                new inline_input_1.InlineInput().show(editor, (v) => v)
                    .then((value) => {
                    this.decorator.removeDecorations(editor);
                    if (!value)
                        return;
                    if (value === '\n') {
                        let model = models.find(model => model.indexInModels === 0);
                        if (model) {
                            this.currentFindIndex = 0;
                            resolve(model);
                        }
                    }
                    else if (value === ' ') {
                        let model = models.find(model => model.indexInModels === 1);
                        if (model) {
                            this.currentFindIndex = 1;
                            resolve(model);
                        }
                    }
                    let model = models.find(model => model.code[0] && model.code[0].toLowerCase() === value.toLowerCase());
                    if (model.children.length > 1) {
                        this.prepareForJumpTo(editor, model.children)
                            .then((model) => {
                            this.decorator.removeDecorations(editor);
                            resolve(model);
                        })
                            .catch(() => {
                            this.decorator.removeDecorations(editor);
                            reject();
                        });
                    }
                    else {
                        resolve(model);
                        this.currentFindIndex = model.indexInModels;
                    }
                }).catch(() => {
                    this.decorator.removeDecorations(editor);
                    messageDisposable.dispose();
                    reject();
                });
            });
        };
        let disposables = [];
        this.config = config;
        this.viewPort = new viewport_1.ViewPort();
        this.halfViewPortRange = Math.trunc(this.config.jumper.range / 2); // 0.5
        // determines whether to find from center of the screen.
        this.findFromCenterScreenRange = Math.trunc(this.config.jumper.range * 2 / 5); // 0.4
        // disposables.push(vscode.commands.registerCommand('metaGo.cancel', ()=>this.cancel));
        disposables.push(vscode.commands.registerCommand('metaGo.goto', () => {
            this.isSelectionMode = false;
            try {
                this.metaJump()
                    .then((model) => {
                    this.done();
                    lib_1.Utilities.goto(model.line, model.character + 1);
                }).catch(() => this.cancel());
            }
            catch (err) {
                this.cancel();
                console.log("metago:" + err);
            }
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoInteli', () => {
            this.isSelectionMode = false;
            try {
                this.metaJump()
                    .then((model) => {
                    this.done();
                    lib_1.Utilities.goto(model.line, model.character + 1 + model.inteliAdj);
                })
                    .catch(() => {
                    this.cancel();
                });
            }
            catch (err) {
                this.cancel();
                console.log("metago:" + err.message + err.stack);
            }
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoBefore', () => {
            this.isSelectionMode = false;
            try {
                this.metaJump()
                    .then((model) => {
                    this.done();
                    lib_1.Utilities.goto(model.line, model.character);
                }).catch(() => this.cancel());
            }
            catch (err) {
                this.cancel();
                console.log("metago:" + err);
            }
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.selection', () => {
            this.isSelectionMode = true;
            let editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let position = selection.active.line === selection.end.line ? selection.start : selection.end;
            let fromLine = position.line;
            let fromChar = position.character;
            try {
                this.metaJump()
                    .then((model) => {
                    this.done();
                    let toCharacter = model.character;
                    if (model.line > fromLine) {
                        toCharacter++;
                    }
                    else if (model.line === fromLine) {
                        if (model.character > fromChar) {
                            toCharacter++;
                        }
                    }
                    lib_1.Utilities.select(fromLine, fromChar, model.line, toCharacter);
                })
                    .catch(() => this.cancel());
            }
            catch (err) {
                this.cancel();
                console.log("metago:" + err);
            }
        }));
        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }
        this.decorationModelBuilder.initialize(this.config);
        this.decorator.initialize(this.config);
    }
    done() {
        this.isJumping = false;
    }
    cancel() {
        while (inline_input_1.InlineInput.instances.length > 0) {
            inline_input_1.InlineInput.instances[0].cancelInput();
        }
        this.isJumping = false;
    }
    getPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            let editor = vscode.window.activeTextEditor;
            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            yield this.viewPort.moveCursorToCenter(false);
            let toLine = editor.selection.active.line;
            let cursorMoveBoundary = this.findFromCenterScreenRange;
            if (Math.abs(toLine - fromLine) < cursorMoveBoundary) {
                // back
                editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
            }
            ;
        });
    }
    metaJump() {
        let editor = vscode.window.activeTextEditor;
        let fromLine = editor.selection.active.line;
        let fromChar = editor.selection.active.character;
        let jumpTimeoutId = null;
        if (!this.isJumping) {
            this.isJumping = true;
            jumpTimeoutId = setTimeout(() => { jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
            return new Promise((resolve, reject) => {
                return this.jump((editor, model) => { resolve(model); })
                    .then(() => {
                    if (jumpTimeoutId)
                        clearTimeout(jumpTimeoutId);
                })
                    .catch(() => {
                    if (jumpTimeoutId)
                        clearTimeout(jumpTimeoutId);
                    reject();
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                reject('metago: reinvoke goto command');
            });
        }
    }
    getSelection(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            let selection = new Selection();
            if (!editor.selection.isEmpty && this.config.jumper.findInSelection === 'on') {
                selection.text = editor.document.getText(editor.selection);
                if (editor.selection.anchor.line > editor.selection.active.line) {
                    selection.startLine = editor.selection.active.line;
                    selection.lastLine = editor.selection.anchor.line;
                }
                else {
                    selection.startLine = editor.selection.anchor.line;
                    selection.lastLine = editor.selection.active.line;
                }
                selection.lastLine++;
                return { before: selection, after: Selection.Empty };
            }
            else {
                yield this.getPosition();
                selection.startLine = Math.max(editor.selection.active.line - this.config.jumper.range, 0);
                selection.lastLine = editor.selection.active.line + 1; //current line included in before
                selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));
                let selectionAfter = new Selection();
                selectionAfter.startLine = editor.selection.active.line + 1;
                selectionAfter.lastLine = Math.min(editor.selection.active.line + this.config.jumper.range, editor.document.lineCount);
                selectionAfter.text = editor.document.getText(new vscode.Range(selectionAfter.startLine, 0, selectionAfter.lastLine, 0));
                return { before: selection, after: selectionAfter };
            }
        });
    }
    inteliAdjBefore(str, char, index) {
        let regexp = new RegExp('\\w');
        if (this.inteliAdjBeforeRegex(str, char, index, regexp) === decoration_model_1.InteliAdjustment.Before) {
            return decoration_model_1.InteliAdjustment.Before;
        }
        regexp = new RegExp(/[^\w\s]/);
        return this.inteliAdjBeforeRegex(str, char, index, regexp);
    }
    inteliAdjBeforeRegex(str, char, index, regexp) {
        if (regexp.test(char)) {
            if (index === 0 && str.length !== 1) {
                if (regexp.test(str[1]))
                    return decoration_model_1.InteliAdjustment.Before;
            }
            else {
                if (str[index + 1] && regexp.test(str[index + 1]) && !regexp.test(str[index - 1]))
                    return decoration_model_1.InteliAdjustment.Before;
            }
        }
        return decoration_model_1.InteliAdjustment.Default;
    }
}
exports.MetaJumper = MetaJumper;
//# sourceMappingURL=index.js.map