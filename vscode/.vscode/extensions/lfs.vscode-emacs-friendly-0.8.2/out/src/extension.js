"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const operation_1 = require("./operation");
var inMarkMode = false;
var markHasMoved = false;
function activate(context) {
    let op = new operation_1.Operation(), commandList = [
        "C-g",
        // Edit
        "C-k", "C-w", "M-w", "C-y", "C-x_C-o",
        "C-x_u", "C-/", "C-j", "C-S_bs",
        // Navigation
        "C-l",
    ], cursorMoves = [
        "cursorUp", "cursorDown", "cursorLeft", "cursorRight",
        "cursorHome", "cursorEnd",
        "cursorWordLeft", "cursorWordRight",
        "cursorPageDown", "cursorPageUp",
        "cursorTop", "cursorBottom"
    ];
    commandList.forEach(commandName => {
        context.subscriptions.push(registerCommand(commandName, op));
    });
    cursorMoves.forEach(element => {
        context.subscriptions.push(vscode.commands.registerCommand("emacs." + element, () => {
            if (inMarkMode) {
                markHasMoved = true;
            }
            vscode.commands.executeCommand(inMarkMode ?
                element + "Select" :
                element);
        }));
    });
    initMarkMode(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function initMarkMode(context) {
    context.subscriptions.push(vscode.commands.registerCommand('emacs.enterMarkMode', () => {
        if (inMarkMode && !markHasMoved) {
            inMarkMode = false;
        }
        else {
            initSelection();
            inMarkMode = true;
            markHasMoved = false;
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('emacs.exitMarkMode', () => {
        vscode.commands.executeCommand("cancelSelection");
        if (inMarkMode) {
            inMarkMode = false;
        }
    }));
}
function registerCommand(commandName, op) {
    return vscode.commands.registerCommand("emacs." + commandName, op.getCommand(commandName));
}
function initSelection() {
    var currentPosition = vscode.window.activeTextEditor.selection.active;
    vscode.window.activeTextEditor.selection = new vscode.Selection(currentPosition, currentPosition);
}
//# sourceMappingURL=extension.js.map