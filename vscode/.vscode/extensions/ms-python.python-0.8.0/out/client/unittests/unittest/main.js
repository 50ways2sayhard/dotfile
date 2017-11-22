'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const installer_1 = require("../../common/installer");
const baseTestManager_1 = require("../common/baseTestManager");
const types_1 = require("../common/types");
const collector_1 = require("./collector");
const runner_1 = require("./runner");
class TestManager extends baseTestManager_1.BaseTestManager {
    constructor(rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher) {
        super('unittest', installer_1.Product.unittest, rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper);
        this.debugLauncher = debugLauncher;
    }
    // tslint:disable-next-line:no-empty
    configure() {
    }
    discoverTestsImpl(ignoreCache) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.settings.unitTest.unittestArgs.slice(0);
            // tslint:disable-next-line:no-non-null-assertion
            return collector_1.discoverTests(this.rootDirectory, args, this.testDiscoveryCancellationToken, ignoreCache, this.outputChannel, this.testsHelper);
        });
    }
    runTestImpl(tests, testsToRun, runFailedTests, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.settings.unitTest.unittestArgs.slice(0);
            if (runFailedTests === true) {
                testsToRun = { testFile: [], testFolder: [], testSuite: [], testFunction: [] };
                testsToRun.testFunction = tests.testFunctions.filter(fn => {
                    return fn.testFunction.status === types_1.TestStatus.Error || fn.testFunction.status === types_1.TestStatus.Fail;
                }).map(fn => fn.testFunction);
            }
            return runner_1.runTest(this, this.testResultsService, this.debugLauncher, this.rootDirectory, tests, args, testsToRun, this.testRunnerCancellationToken, this.outputChannel, debug);
        });
    }
}
exports.TestManager = TestManager;
//# sourceMappingURL=main.js.map