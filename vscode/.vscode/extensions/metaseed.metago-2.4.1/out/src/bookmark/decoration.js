"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
class Decoration {
    constructor(config, context, manager) {
        this.config = config;
        this.context = context;
        this.manager = manager;
        this.update = () => {
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }
            if (!this.manager.activeDocument) {
                return;
            }
            if (this.manager.activeDocument.bookmarks.size === 0) {
                this.clear();
                return;
            }
            const lineMarks = [];
            const charMarks = []; //vscode.DecorationOptions[] = [];
            if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
                this.manager.activeDocument.clear();
            }
            else {
                let invalids = [];
                for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                    if (bm.line <= activeEditor.document.lineCount) {
                        const lineDecoration = new vscode.Range(bm.line, 0, bm.line, 0);
                        lineMarks.push(lineDecoration);
                        // const charDecorationOption = {
                        //     range: new vscode.Range(bm.line, bm.char, bm.line, bm.char),
                        //     // renderOptions: {
                        //     //     dark: {
                        //     //         after: {
                        //     //             contentIconPath: this.buildUri()
                        //     //         }
                        //     //     },
                        //     //     light: {
                        //     //         after: {
                        //     //             contentIconPath: this.buildUri()
                        //     //         }
                        //     //     }
                        //     // }
                        // };
                        charMarks.push(new vscode.Range(bm.line, bm.char, bm.line, bm.char));
                    }
                    else {
                        invalids.push(key);
                    }
                }
                if (invalids.length > 0) {
                    let idxInvalid;
                    for (const key of invalids) {
                        this.manager.activeDocument.removeBookmark(key);
                    }
                }
            }
            activeEditor.setDecorations(this.lineDecorationType, lineMarks);
            activeEditor.setDecorations(this.charDecorationType, charMarks);
        };
        this.buildUri = () => {
            let width = 6;
            let height = 18;
            let bgColor = 'blue';
            let bgOpacity = '1';
            let borderColor = 'lightblue';
            let svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" height="${height}" width="${width}"><rect width="${width}" height="${height}" rx="0" ry="0" style="fill: ${bgColor};fill-opacity:${bgOpacity};stroke:${borderColor};stroke-opacity:${bgOpacity};"/></svg>`;
            return vscode.Uri.parse(svg);
        };
        if (config.pathIcon !== "") {
            if (!fs.existsSync(config.pathIcon)) {
                vscode.window.showErrorMessage('The file "' + config.pathIcon + '" used for "this.bookmarks.gutterIconPath" does not exists.');
                config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
            }
        }
        else {
            config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
        }
        config.pathIcon = config.pathIcon.replace(/\\/g, "/");
        this.lineDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: config.pathIcon,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            overviewRulerColor: "rgba(21, 126, 251, 0.7)"
        });
        this.charDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255,0,0,0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'mediumblue '
            }
        });
    }
    clear() {
        let books = [];
        vscode.window.activeTextEditor.setDecorations(this.lineDecorationType, books);
        vscode.window.activeTextEditor.setDecorations(this.charDecorationType, books);
    }
}
exports.Decoration = Decoration;
//# sourceMappingURL=decoration.js.map