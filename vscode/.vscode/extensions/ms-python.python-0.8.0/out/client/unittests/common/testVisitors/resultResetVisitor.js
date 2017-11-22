"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class TestResultResetVisitor {
    visitTestFunction(testFunction) {
        testFunction.passed = null;
        testFunction.time = 0;
        testFunction.message = '';
        testFunction.traceback = '';
        testFunction.status = types_1.TestStatus.Unknown;
        testFunction.functionsFailed = 0;
        testFunction.functionsPassed = 0;
        testFunction.functionsDidNotRun = 0;
    }
    visitTestSuite(testSuite) {
        testSuite.passed = null;
        testSuite.time = 0;
        testSuite.status = types_1.TestStatus.Unknown;
        testSuite.functionsFailed = 0;
        testSuite.functionsPassed = 0;
        testSuite.functionsDidNotRun = 0;
    }
    visitTestFile(testFile) {
        testFile.passed = null;
        testFile.time = 0;
        testFile.status = types_1.TestStatus.Unknown;
        testFile.functionsFailed = 0;
        testFile.functionsPassed = 0;
        testFile.functionsDidNotRun = 0;
    }
    visitTestFolder(testFolder) {
        testFolder.functionsDidNotRun = 0;
        testFolder.functionsFailed = 0;
        testFolder.functionsPassed = 0;
        testFolder.passed = null;
        testFolder.status = types_1.TestStatus.Unknown;
    }
}
exports.TestResultResetVisitor = TestResultResetVisitor;
//# sourceMappingURL=resultResetVisitor.js.map