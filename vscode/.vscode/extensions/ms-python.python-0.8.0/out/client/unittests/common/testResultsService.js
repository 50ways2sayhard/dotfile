"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resultResetVisitor_1 = require("./testVisitors/resultResetVisitor");
const types_1 = require("./types");
class TestResultsService {
    resetResults(tests) {
        const resultResetVisitor = new resultResetVisitor_1.TestResultResetVisitor();
        tests.testFolders.forEach(f => resultResetVisitor.visitTestFolder(f));
        tests.testFunctions.forEach(fn => resultResetVisitor.visitTestFunction(fn.testFunction));
        tests.testSuites.forEach(suite => resultResetVisitor.visitTestSuite(suite.testSuite));
        tests.testFiles.forEach(testFile => resultResetVisitor.visitTestFile(testFile));
    }
    updateResults(tests) {
        tests.testFiles.forEach(test => this.updateTestFileResults(test));
        tests.testFolders.forEach(folder => this.updateTestFolderResults(folder));
    }
    updateTestSuiteResults(test) {
        this.updateTestSuiteAndFileResults(test);
    }
    updateTestFileResults(test) {
        this.updateTestSuiteAndFileResults(test);
    }
    updateTestFolderResults(testFolder) {
        let allFilesPassed = true;
        let allFilesRan = true;
        testFolder.testFiles.forEach(fl => {
            if (allFilesPassed && typeof fl.passed === 'boolean') {
                if (!fl.passed) {
                    allFilesPassed = false;
                }
            }
            else {
                allFilesRan = false;
            }
            testFolder.functionsFailed += fl.functionsFailed;
            testFolder.functionsPassed += fl.functionsPassed;
        });
        let allFoldersPassed = true;
        let allFoldersRan = true;
        testFolder.folders.forEach(folder => {
            this.updateTestFolderResults(folder);
            if (allFoldersPassed && typeof folder.passed === 'boolean') {
                if (!folder.passed) {
                    allFoldersPassed = false;
                }
            }
            else {
                allFoldersRan = false;
            }
            testFolder.functionsFailed += folder.functionsFailed;
            testFolder.functionsPassed += folder.functionsPassed;
        });
        if (allFilesRan && allFoldersRan) {
            testFolder.passed = allFilesPassed && allFoldersPassed;
            testFolder.status = testFolder.passed ? types_1.TestStatus.Idle : types_1.TestStatus.Fail;
        }
        else {
            testFolder.passed = null;
            testFolder.status = types_1.TestStatus.Unknown;
        }
    }
    updateTestSuiteAndFileResults(test) {
        let totalTime = 0;
        let allFunctionsPassed = true;
        let allFunctionsRan = true;
        test.functions.forEach(fn => {
            totalTime += fn.time;
            if (typeof fn.passed === 'boolean') {
                if (fn.passed) {
                    test.functionsPassed += 1;
                }
                else {
                    test.functionsFailed += 1;
                    allFunctionsPassed = false;
                }
            }
            else {
                allFunctionsRan = false;
            }
        });
        let allSuitesPassed = true;
        let allSuitesRan = true;
        test.suites.forEach(suite => {
            this.updateTestSuiteResults(suite);
            totalTime += suite.time;
            if (allSuitesRan && typeof suite.passed === 'boolean') {
                if (!suite.passed) {
                    allSuitesPassed = false;
                }
            }
            else {
                allSuitesRan = false;
            }
            test.functionsFailed += suite.functionsFailed;
            test.functionsPassed += suite.functionsPassed;
        });
        test.time = totalTime;
        if (allSuitesRan && allFunctionsRan) {
            test.passed = allFunctionsPassed && allSuitesPassed;
            test.status = test.passed ? types_1.TestStatus.Idle : types_1.TestStatus.Error;
        }
        else {
            test.passed = null;
            test.status = types_1.TestStatus.Unknown;
        }
    }
}
exports.TestResultsService = TestResultsService;
//# sourceMappingURL=testResultsService.js.map