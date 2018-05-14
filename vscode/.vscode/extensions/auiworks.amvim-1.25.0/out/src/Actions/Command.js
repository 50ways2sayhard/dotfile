"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ActionCommand {
    static goToLine() {
        return vscode_1.commands.executeCommand('workbench.action.gotoLine');
    }
}
exports.ActionCommand = ActionCommand;
//# sourceMappingURL=Command.js.map