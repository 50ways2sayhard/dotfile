'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path_1 = require("path");
const utils = require("./utils");
const constants_1 = require("./constants");
var inflection = require('inflection');
class RailsHelper {
    constructor(relativeFileName, line) {
        this.patterns = [
            path_1.join(constants_1.REL_CONTROLLERS, "PTN", "*"),
            path_1.join(constants_1.REL_CONTROLLERS, "PTN*"),
            path_1.join(constants_1.REL_MODELS, "SINGULARIZE", "*"),
            path_1.join(constants_1.REL_MODELS, "SINGULARIZE*"),
            path_1.join(constants_1.REL_MODELS, "BASENAME_SINGULARIZE", "*"),
            path_1.join(constants_1.REL_MODELS, "BASENAME_SINGULARIZE*"),
            path_1.join(constants_1.REL_VIEWS, "PTN", "*"),
            path_1.join(constants_1.REL_VIEWS, "PTN*"),
            path_1.join(constants_1.REL_LAYOUTS, "PTN", "*"),
            path_1.join(constants_1.REL_LAYOUTS, "PTN*"),
            path_1.join(constants_1.REL_HELPERS, "PTN", "*"),
            path_1.join(constants_1.REL_HELPERS, "PTN*"),
            path_1.join(constants_1.REL_JAVASCRIPTS, "PTN", "*"),
            path_1.join(constants_1.REL_JAVASCRIPTS, "PTN*"),
            path_1.join(constants_1.REL_STYLESHEETS, "PTN", "*"),
            path_1.join(constants_1.REL_STYLESHEETS, "PTN*")
        ];
        this.items = [];
        this.relativeFileName = relativeFileName;
        this.fileName = path_1.basename(relativeFileName);
        let filePath = path_1.dirname(relativeFileName);
        this.line = line;
        this.initPatten(filePath);
    }
    searchPaths() {
        var res = [];
        this.patterns.forEach(e => {
            var p = e.replace("PTN", this.filePatten.toString());
            p = p.replace("BASENAME_SINGULARIZE", inflection.singularize(path_1.basename(this.filePatten.toString())));
            p = p.replace("SINGULARIZE", inflection.singularize(this.filePatten.toString()));
            res.push(p);
        });
        return res;
    }
    initPatten(filePath) {
        this.filePatten = null;
        this.targetFile = null;
        let fileType = utils.dectFileType(filePath), prefix = filePath.substring(constants_1.FileTypeRelPath.get(fileType).length + 1);
        switch (fileType) {
            case constants_1.FileType.Controller:
                this.filePatten = path_1.join(prefix, this.fileName.replace(/_controller\.rb$/, ""));
                if (this.line && /^def\s+/.test(this.line)) {
                    this.filePatten = path_1.join(this.filePatten, this.line.replace(/^def\s+/, ""));
                }
                break;
            case constants_1.FileType.Model:
                let filePatten = path_1.join(prefix, this.fileName.replace(/\.rb$/, ""));
                this.filePatten = inflection.pluralize(this.filePatten.toString());
                break;
            case constants_1.FileType.Layout:
                this.filePatten = path_1.join(prefix, this.fileName.replace(/\..*?\..*?$/, ""));
                break;
            case constants_1.FileType.View:
                this.filePatten = prefix;
                break;
            case constants_1.FileType.Helper:
                this.filePatten = path_1.join(prefix, this.fileName.replace(/_helper\.rb$/, ""));
                break;
            case constants_1.FileType.Javascript:
                this.filePatten = path_1.join(prefix, this.fileName.replace(/\.js$/, "").replace(/\..*?\..*?$/, ""));
                break;
            case constants_1.FileType.StyleSheet:
                this.filePatten = path_1.join(prefix, this.fileName.replace(/\.css$/, "").replace(/\..*?\..*?$/, ""));
                break;
            case constants_1.FileType.Rspec:
                this.targetFile = path_1.join("app", prefix, this.fileName.replace("_spec.rb", ".rb"));
                break;
            case constants_1.FileType.Test:
                this.filePatten = path_1.join("app", prefix, this.fileName.replace("_test.rb", ".rb"));
                break;
        }
    }
    generateList(arr) {
        var cur = arr.pop();
        var _self = this;
        vscode.workspace.findFiles(cur.toString(), null).then((res) => {
            res.forEach(i => {
                var fn = vscode.workspace.asRelativePath(i);
                if (_self.relativeFileName !== fn)
                    _self.items.push(fn);
            });
            if (arr.length > 0) {
                _self.generateList(arr);
            }
            else {
                this.showQuickPick(_self.items);
            }
        });
    }
    showQuickPick(items) {
        const p = vscode.window.showQuickPick(items, { placeHolder: "Select File", matchOnDetail: true });
        p.then(value => {
            if (!value)
                return;
            const fn = vscode.Uri.parse('file://' + path_1.join(vscode.workspace.rootPath, value));
            vscode.workspace.openTextDocument(fn).then(doc => {
                return vscode.window.showTextDocument(doc);
            });
        });
    }
    showFileList() {
        if (this.filePatten != null) {
            var paths = this.searchPaths().slice();
            this.generateList(paths);
        }
        else if (this.targetFile != null) {
            this.generateList([this.targetFile]);
        }
    }
}
exports.RailsHelper = RailsHelper;
//# sourceMappingURL=rails_helper.js.map