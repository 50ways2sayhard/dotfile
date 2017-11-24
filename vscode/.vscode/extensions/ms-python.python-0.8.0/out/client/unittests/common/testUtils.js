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
const path = require("path");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
const constants = require("../../common/constants");
const constants_1 = require("./constants");
const flatteningVisitor_1 = require("./testVisitors/flatteningVisitor");
function selectTestWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(vscode_1.workspace.workspaceFolders) || vscode_1.workspace.workspaceFolders.length === 0) {
            return undefined;
        }
        else if (vscode_1.workspace.workspaceFolders.length === 1) {
            return vscode_1.workspace.workspaceFolders[0].uri;
        }
        else {
            // tslint:disable-next-line:no-any prefer-type-cast
            const workspaceFolder = yield vscode_2.window.showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
            return workspaceFolder ? workspaceFolder.uri : undefined;
        }
    });
}
exports.selectTestWorkspace = selectTestWorkspace;
function displayTestErrorMessage(message) {
    vscode.window.showErrorMessage(message, constants.Button_Text_Tests_View_Output).then(action => {
        if (action === constants.Button_Text_Tests_View_Output) {
            vscode.commands.executeCommand(constants.Commands.Tests_ViewOutput, constants_1.CommandSource.ui);
        }
    });
}
exports.displayTestErrorMessage = displayTestErrorMessage;
function extractBetweenDelimiters(content, startDelimiter, endDelimiter) {
    content = content.substring(content.indexOf(startDelimiter) + startDelimiter.length);
    return content.substring(0, content.lastIndexOf(endDelimiter));
}
exports.extractBetweenDelimiters = extractBetweenDelimiters;
function convertFileToPackage(filePath) {
    const lastIndex = filePath.lastIndexOf('.');
    return filePath.substring(0, lastIndex).replace(/\//g, '.').replace(/\\/g, '.');
}
exports.convertFileToPackage = convertFileToPackage;
class TestsHelper {
    flattenTestFiles(testFiles) {
        const flatteningVisitor = new flatteningVisitor_1.TestFlatteningVisitor();
        testFiles.forEach(testFile => flatteningVisitor.visitTestFile(testFile));
        const tests = {
            testFiles: testFiles,
            testFunctions: flatteningVisitor.flattenedTestFunctions,
            testSuites: flatteningVisitor.flattenedTestSuites,
            testFolders: [],
            rootTestFolders: [],
            summary: { passed: 0, failures: 0, errors: 0, skipped: 0 }
        };
        this.placeTestFilesIntoFolders(tests);
        return tests;
    }
    placeTestFilesIntoFolders(tests) {
        // First get all the unique folders
        const folders = [];
        tests.testFiles.forEach(file => {
            const dir = path.dirname(file.name);
            if (folders.indexOf(dir) === -1) {
                folders.push(dir);
            }
        });
        tests.testFolders = [];
        const folderMap = new Map();
        folders.sort();
        folders.forEach(dir => {
            dir.split(path.sep).reduce((parentPath, currentName, index, values) => {
                let newPath = currentName;
                let parentFolder;
                if (parentPath.length > 0) {
                    parentFolder = folderMap.get(parentPath);
                    newPath = path.join(parentPath, currentName);
                }
                if (!folderMap.has(newPath)) {
                    const testFolder = { name: newPath, testFiles: [], folders: [], nameToRun: newPath, time: 0 };
                    folderMap.set(newPath, testFolder);
                    if (parentFolder) {
                        parentFolder.folders.push(testFolder);
                    }
                    else {
                        tests.rootTestFolders.push(testFolder);
                    }
                    tests.testFiles.filter(fl => path.dirname(fl.name) === newPath).forEach(testFile => {
                        testFolder.testFiles.push(testFile);
                    });
                    tests.testFolders.push(testFolder);
                }
                return newPath;
            }, '');
        });
    }
    parseTestName(name, rootDirectory, tests) {
        // TODO: We need a better way to match (currently we have raw name, name, xmlname, etc = which one do we.
        // Use to identify a file given the full file name, similarly for a folder and function.
        // Perhaps something like a parser or methods like TestFunction.fromString()... something).
        if (!tests) {
            return null;
        }
        const absolutePath = path.isAbsolute(name) ? name : path.resolve(rootDirectory, name);
        const testFolders = tests.testFolders.filter(folder => folder.nameToRun === name || folder.name === name || folder.name === absolutePath);
        if (testFolders.length > 0) {
            return { testFolder: testFolders };
        }
        const testFiles = tests.testFiles.filter(file => file.nameToRun === name || file.name === name || file.fullPath === absolutePath);
        if (testFiles.length > 0) {
            return { testFile: testFiles };
        }
        const testFns = tests.testFunctions.filter(fn => fn.testFunction.nameToRun === name || fn.testFunction.name === name).map(fn => fn.testFunction);
        if (testFns.length > 0) {
            return { testFunction: testFns };
        }
        // Just return this as a test file.
        return { testFile: [{ name: name, nameToRun: name, functions: [], suites: [], xmlName: name, fullPath: '', time: 0 }] };
    }
}
exports.TestsHelper = TestsHelper;
//# sourceMappingURL=testUtils.js.map