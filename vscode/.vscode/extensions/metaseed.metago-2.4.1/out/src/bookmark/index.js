"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const document_1 = require("./model/document");
const location_1 = require("./model/location");
const manager_1 = require("./manager");
const storage_1 = require("./storage");
const decoration_1 = require("./decoration");
const selection_1 = require("./selection");
const sticky_1 = require("./sticky");
const document_2 = require("./model/document");
class BookmarkExt {
    constructor(context, config) {
        this.context = context;
        this.config = config;
        this.expandLineRange = (editor, toLine, direction) => {
            const doc = editor.document;
            let newSe;
            let actualSelection = editor.selection;
            // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
            if (direction === location_1.JumpDirection.FORWARD) {
                if (actualSelection.isEmpty || !actualSelection.isReversed) {
                    newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
                }
                else {
                    newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, doc.lineAt(toLine).text.length);
                }
            }
            else {
                if (actualSelection.isEmpty || !actualSelection.isReversed) {
                    newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, 0);
                }
                else {
                    newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
                }
            }
            editor.selection = newSe;
        };
        this.shrinkLineRange = (editor, toLine, direction) => {
            const doc = editor.document;
            let newSe;
            // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
            if (direction === location_1.JumpDirection.FORWARD) {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
            }
            else {
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
            }
            editor.selection = newSe;
        };
        this.gotoBookmarkInActiveDoc = (bm) => {
            let reviewType = vscode.TextEditorRevealType.InCenter;
            if (bm.line === vscode.window.activeTextEditor.selection.active.line) {
                reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
            }
            let textInLine = vscode.window.activeTextEditor.document.lineAt(bm.line).text;
            if (bm.char > textInLine.length)
                bm.char = textInLine.length;
            let newSe = new vscode.Selection(bm.line, bm.char, bm.line, bm.char);
            vscode.window.activeTextEditor.selection = newSe;
            vscode.window.activeTextEditor.revealRange(newSe, reviewType);
        };
        this.gotoBookmark = (bookmarkModel, preserveFocus = false) => {
            const bm = bookmarkModel.bookmark;
            const doc = bookmarkModel.document;
            const uri = document_2.Document.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
            if (doc.key !== uri) {
                let uriDocument = vscode.Uri.file(doc.key);
                vscode.workspace.openTextDocument(uriDocument).then(doc => {
                    vscode.window.showTextDocument(doc, undefined, preserveFocus).then(editor => {
                        this.gotoBookmarkInActiveDoc(bm);
                    });
                });
            }
            this.gotoBookmarkInActiveDoc(bm);
        };
        this.removeRootPathFrom = (path) => {
            if (!vscode.workspace.rootPath) {
                return path;
            }
            if (path.indexOf(vscode.workspace.rootPath) === 0) {
                return "$(tag) " + path.split(vscode.workspace.rootPath).pop();
            }
            else {
                return "$(link) " + path;
            }
        };
        this.registerCommands = () => {
            vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToNext", () => this.selection.expandSelectionToNextBookmark(location_1.JumpDirection.FORWARD));
            vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToPrevious", () => this.selection.expandSelectionToNextBookmark(location_1.JumpDirection.BACKWARD));
            vscode.commands.registerCommand("metaGo.bookmark.shrinkSelection", () => this.selection.shrinkSelection());
            vscode.commands.registerCommand("metaGo.bookmark.clearInFile", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                    return;
                }
                this.manager.activeDocument.clear();
                this.storage.save();
                this.decoration.clear();
            });
            vscode.commands.registerCommand("metaGo.bookmark.clear", () => {
                this.manager.clear();
                this.storage.save();
                this.decoration.clear();
            });
            vscode.commands.registerCommand("metaGo.bookmark.selectLines", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                    return;
                }
                if (this.manager.activeDocument.bookmarks.size === 0) {
                    vscode.window.showInformationMessage("No Bookmark found");
                    return;
                }
                this.selection.selectLines(vscode.window.activeTextEditor);
            });
            vscode.commands.registerCommand("metaGo.bookmark.toggle", () => {
                try {
                    this.manager.toggleBookmark();
                    this.storage.save();
                    this.decoration.update();
                }
                catch (err) {
                    console.log(err);
                }
            });
            vscode.commands.registerCommand("metaGo.bookmark.jumpToNext", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to jump to bookmarks");
                    return;
                }
                if (!this.manager.activeDocument) {
                    return;
                }
                this.manager.nextBookmark(location_1.JumpDirection.FORWARD)
                    .then((location) => {
                    if (location === location_1.BookmarkLocation.NO_BOOKMARKS) {
                        vscode.window.showInformationMessage("No bookmarks...");
                    }
                    else {
                        this.gotoBookmark(location);
                    }
                })
                    .catch((error) => {
                    console.log("nextBookmark REJECT" + error);
                });
            });
            vscode.commands.registerCommand("metaGo.bookmark.jumpToPrevious", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to jump to this.bookmarks");
                    return;
                }
                if (!this.manager.activeDocument) {
                    return;
                }
                this.manager.nextBookmark(location_1.JumpDirection.BACKWARD)
                    .then((location) => {
                    if (location === location_1.BookmarkLocation.NO_BOOKMARKS) {
                        vscode.window.showInformationMessage("No bookmarks...");
                    }
                    else {
                        this.gotoBookmark(location);
                    }
                })
                    .catch((error) => {
                    console.log("nextBookmark REJECT" + error);
                });
            });
            vscode.commands.registerCommand("metaGo.bookmark.view", () => {
                if (this.manager.size === 0) {
                    vscode.window.showInformationMessage("No Bookmarks found");
                    return;
                }
                // push the items
                let items = [];
                let activeTextEditorPath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri.fsPath : "";
                let promises = [];
                let currentLine = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.selection.active.line + 1 : -1;
                for (let [key, doc] of this.manager.documents) {
                    let pp = doc.getBookmarkItems();
                    promises.push(pp);
                }
                Promise.all(promises).then((values) => {
                    for (let index = 0; index < values.length; index++) {
                        let element = values[index];
                        for (let indexInside = 0; indexInside < element.length; indexInside++) {
                            let elementInside = element[indexInside];
                            if (elementInside.detail.toString().toLowerCase() === activeTextEditorPath.toLowerCase()) {
                                items.push(new document_1.BookmarkItem(elementInside.label, elementInside.description, null, null, elementInside.location));
                            }
                            else {
                                let itemPath = this.removeRootPathFrom(elementInside.detail);
                                items.push(new document_1.BookmarkItem(elementInside.label, elementInside.description, itemPath, null, elementInside.location));
                            }
                        }
                    }
                    // sort
                    // - active document
                    // - no Octicons - document inside project
                    // - with Octicons - document outside project
                    let itemsSorted;
                    itemsSorted = items.sort(function (a, b) {
                        if (!a.detail && !b.detail) {
                            return 0;
                        }
                        else {
                            if (!a.detail && b.detail) {
                                return -1;
                            }
                            else {
                                if (a.detail && !b.detail) {
                                    return 1;
                                }
                                else {
                                    if ((a.detail.toString().indexOf("$(link) ") === 0) && (b.detail.toString().indexOf("$(link) ") === -1)) {
                                        return 1;
                                    }
                                    else {
                                        if ((a.detail.toString().indexOf("$(link) ") === -1) && (b.detail.toString().indexOf("$(link) ") === 0)) {
                                            return -1;
                                        }
                                        else {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    items.push(new document_1.BookmarkItem('c', 'clear bookmarks in current file', null, 'metaGo.bookmark.clearInFile'));
                    items.push(new document_1.BookmarkItem('cc', 'clear all bookmarks in workspace', null, 'metaGo.bookmark.clear'));
                    items.splice(0, 0, new document_1.BookmarkItem('p', 'jump to previous bookmark', null, 'metaGo.bookmark.jumpToPrevious'));
                    items.splice(0, 0, new document_1.BookmarkItem('n', 'jump to next bookmark', null, 'metaGo.bookmark.jumpToNext'));
                    let options = {
                        placeHolder: "Type a line number or a piece of code to navigate to",
                        matchOnDescription: true,
                        onDidSelectItem: (item) => {
                            let filePath;
                            if (item.commandId)
                                return;
                            // no detail - previously active document
                            if (!item.detail) {
                                filePath = activeTextEditorPath;
                            }
                            else {
                                // with icon - document outside project
                                if (item.detail.toString().indexOf("$(link) ") === 0) {
                                    filePath = item.detail.toString().split("$(link) ").pop();
                                }
                                else if (item.detail.toString().indexOf("$(tag) ") === 0) {
                                    filePath = vscode.workspace.rootPath + item.detail.toString().split("$(tag) ").pop();
                                }
                                else {
                                    filePath = vscode.workspace.rootPath + item.detail.toString();
                                }
                            }
                            this.gotoBookmark(item.location, true);
                        }
                    };
                    vscode.window.showQuickPick(itemsSorted, options).then((selection) => {
                        if (typeof selection === "undefined") {
                            return;
                        }
                        if (selection.commandId) {
                            vscode.commands.executeCommand(selection.commandId);
                            return;
                        }
                        else {
                            this.gotoBookmark(selection.location);
                        }
                    });
                });
            });
        };
        this.manager = new manager_1.BookmarkManager();
        this.storage = new storage_1.Storage(this.config, this.context, this.manager);
        this.decoration = new decoration_1.Decoration(this.config, this.context, this.manager);
        this.selection = new selection_1.Selection(this.manager);
        this.sticky = new sticky_1.StickyBookmark(this.manager);
        this.storage.load();
        // Timeout
        let timeout = null;
        let triggerUpdateDecorations = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(this.decoration.update, 100);
        };
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.sticky.activeEditorCountLine = activeEditor.document.lineCount;
            this.manager.activeDocument = this.manager.addDocumentIfNotExist(activeEditor.document.uri.fsPath);
            triggerUpdateDecorations();
        }
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = vscode.window.activeTextEditor;
            if (editor) {
                this.sticky.activeEditorCountLine = editor.document.lineCount;
                this.manager.activeDocument = this.manager.addDocumentIfNotExist(editor.document.uri.fsPath);
                triggerUpdateDecorations();
            }
        }, null, context.subscriptions);
        vscode.workspace.onDidOpenTextDocument(doc => {
            this.manager.addDocumentIfNotExist(doc.uri.fsPath);
        });
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                let updatedBookmark = true;
                if (this.manager.activeDocument && this.manager.activeDocument.bookmarks.size > 0) {
                    updatedBookmark = this.sticky.stickyBookmarks(event);
                }
                this.sticky.activeEditorCountLine = event.document.lineCount;
                this.decoration.update();
                if (updatedBookmark) {
                    this.storage.save();
                }
            }
        }, null, context.subscriptions);
        this.registerCommands();
    }
}
exports.BookmarkExt = BookmarkExt;
//# sourceMappingURL=index.js.map