"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class TestFolderGenerationVisitor {
    constructor() {
        // tslint:disable-next-line:variable-name
        this._testFolders = [];
        // tslint:disable-next-line:variable-name
        this._rootTestFolders = [];
        this.folderMap = new Map();
    }
    get testFolders() {
        return [...this._testFolders];
    }
    get rootTestFolders() {
        return [...this._rootTestFolders];
    }
    // tslint:disable-next-line:no-empty
    visitTestFunction(testFunction) { }
    // tslint:disable-next-line:no-empty
    visitTestSuite(testSuite) { }
    visitTestFile(testFile) {
        // First get all the unique folders
        const folders = [];
        const dir = path.dirname(testFile.name);
        if (this.folderMap.has(dir)) {
            const folder = this.folderMap.get(dir);
            folder.testFiles.push(testFile);
            return;
        }
        dir.split(path.sep).reduce((accumulatedPath, currentName, index) => {
            let newPath = currentName;
            let parentFolder;
            if (accumulatedPath.length > 0) {
                parentFolder = this.folderMap.get(accumulatedPath);
                newPath = path.join(accumulatedPath, currentName);
            }
            if (!this.folderMap.has(newPath)) {
                const testFolder = { name: newPath, testFiles: [], folders: [], nameToRun: newPath, time: 0 };
                this.folderMap.set(newPath, testFolder);
                if (parentFolder) {
                    parentFolder.folders.push(testFolder);
                }
                else {
                    this._rootTestFolders.push(testFolder);
                }
                this._testFolders.push(testFolder);
            }
            return newPath;
        }, '');
        // tslint:disable-next-line:no-non-null-assertion
        this.folderMap.get(dir).testFiles.push(testFile);
    }
    // tslint:disable-next-line:no-empty
    visitTestFolder(testFile) { }
}
exports.TestFolderGenerationVisitor = TestFolderGenerationVisitor;
//# sourceMappingURL=folderGenerationVisitor.js.map