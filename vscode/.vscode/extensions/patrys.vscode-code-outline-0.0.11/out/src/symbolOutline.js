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
const vscode_1 = require("vscode");
const path = require("path");
let optsSortOrder = [];
let optsTopLevel = [];
let optsExpandNodes = [];
let optsDoSort = true;
let optsDoSelect = true;
class SymbolNode {
    constructor(symbol) {
        this.children = [];
        this.symbol = symbol;
    }
    /**
     * Judge if a node should be expanded automatically.
     * @param kind
     */
    static shouldAutoExpand(kind) {
        let ix = optsExpandNodes.indexOf(kind);
        if (ix < 0) {
            ix = optsExpandNodes.indexOf(-1);
        }
        return ix > -1;
    }
    getKindOrder(kind) {
        let ix = optsSortOrder.indexOf(kind);
        if (ix < 0) {
            ix = optsSortOrder.indexOf(-1);
        }
        return ix;
    }
    compareSymbols(a, b) {
        const kindOrder = this.getKindOrder(a.symbol.kind) - this.getKindOrder(b.symbol.kind);
        if (kindOrder !== 0) {
            return kindOrder;
        }
        if (a.symbol.name.toLowerCase() > b.symbol.name.toLowerCase()) {
            return 1;
        }
        return -1;
    }
    sort() {
        this.children.sort(this.compareSymbols.bind(this));
        this.children.forEach(child => child.sort());
    }
    addChild(child) {
        this.children.push(child);
    }
}
exports.SymbolNode = SymbolNode;
class SymbolOutlineProvider {
    constructor(context) {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.context = context;
        vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.refresh();
            }
        });
        vscode_1.workspace.onDidCloseTextDocument(document => {
            if (!this.editor.document) {
                this.refresh();
            }
        });
        vscode_1.workspace.onDidChangeTextDocument(event => {
            if (!event.document.isDirty && event.document === this.editor.document) {
                this.refresh();
            }
        });
        vscode_1.workspace.onDidSaveTextDocument(document => {
            if (document === this.editor.document) {
                this.refresh();
            }
        });
    }
    getSymbols(document) {
        return vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
    }
    updateSymbols(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const tree = new SymbolNode();
            this.editor = editor;
            if (editor) {
                readOpts();
                let symbols = yield this.getSymbols(editor.document);
                if (optsTopLevel.indexOf(-1) < 0) {
                    symbols = symbols.filter(sym => optsTopLevel.indexOf(sym.kind) >= 0);
                }
                const symbolNodes = symbols.map(symbol => new SymbolNode(symbol));
                symbolNodes.forEach(currentNode => {
                    const potentialParents = symbolNodes.filter(node => node !== currentNode && node.symbol.location.range.contains(currentNode.symbol.location.range));
                    if (!potentialParents.length) {
                        tree.addChild(currentNode);
                        return;
                    }
                    potentialParents.sort((a, b) => {
                        const startComparison = b.symbol.location.range.start.compareTo(a.symbol.location.range.start);
                        if (startComparison !== 0) {
                            return startComparison;
                        }
                        return a.symbol.location.range.end.compareTo(b.symbol.location.range.end);
                    });
                    const parent = potentialParents[0];
                    parent.addChild(currentNode);
                });
                if (optsDoSort) {
                    tree.sort();
                }
            }
            this.tree = tree;
        });
    }
    getChildren(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node) {
                return node.children;
            }
            else {
                yield this.updateSymbols(vscode_1.window.activeTextEditor);
                return this.tree ? this.tree.children : [];
            }
        });
    }
    getIcon(kind) {
        let icon;
        switch (kind) {
            case vscode_1.SymbolKind.Class:
                icon = 'class';
                break;
            case vscode_1.SymbolKind.Constant:
                icon = 'constant';
                break;
            case vscode_1.SymbolKind.Constructor:
            case vscode_1.SymbolKind.Function:
            case vscode_1.SymbolKind.Method:
                icon = 'function';
                break;
            case vscode_1.SymbolKind.Interface:
                icon = 'interface';
            case vscode_1.SymbolKind.Module:
            case vscode_1.SymbolKind.Namespace:
            case vscode_1.SymbolKind.Object:
            case vscode_1.SymbolKind.Package:
                icon = 'module';
                break;
            case vscode_1.SymbolKind.Property:
                icon = 'property';
                break;
            default:
                icon = 'variable';
                break;
        }
        icon = `icon-${icon}.svg`;
        return {
            dark: this.context.asAbsolutePath(path.join('resources', 'dark', icon)),
            light: this.context.asAbsolutePath(path.join('resources', 'light', icon))
        };
    }
    getTreeItem(node) {
        const { kind } = node.symbol;
        let treeItem = new vscode_1.TreeItem(node.symbol.name);
        if (node.children.length) {
            treeItem.collapsibleState = optsExpandNodes.length && SymbolNode.shouldAutoExpand(kind) ?
                vscode_1.TreeItemCollapsibleState.Expanded : vscode_1.TreeItemCollapsibleState.Collapsed;
        }
        else {
            treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        }
        const range = optsDoSelect ? node.symbol.location.range : new vscode_1.Range(node.symbol.location.range.start, node.symbol.location.range.start);
        treeItem.command = {
            command: 'symbolOutline.revealRange',
            title: '',
            arguments: [
                this.editor,
                range
            ]
        };
        treeItem.iconPath = this.getIcon(kind);
        return treeItem;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.SymbolOutlineProvider = SymbolOutlineProvider;
function readOpts() {
    let opts = vscode_1.workspace.getConfiguration("symbolOutline");
    optsDoSort = opts.get("doSort");
    optsDoSelect = opts.get("doSelect");
    optsExpandNodes = convertEnumNames(opts.get("expandNodes"));
    optsSortOrder = convertEnumNames(opts.get("sortOrder"));
    optsTopLevel = convertEnumNames(opts.get("topLevel"));
}
function convertEnumNames(names) {
    return names.map(str => {
        let v = vscode_1.SymbolKind[str];
        return typeof v === "undefined" ? -1 : v;
    });
}
//# sourceMappingURL=symbolOutline.js.map