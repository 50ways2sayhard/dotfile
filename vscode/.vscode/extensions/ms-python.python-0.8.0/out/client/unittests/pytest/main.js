'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const installer_1 = require("../../common/installer");
const baseTestManager_1 = require("../common/baseTestManager");
const collector_1 = require("./collector");
const runner_1 = require("./runner");
class TestManager extends baseTestManager_1.BaseTestManager {
    constructor(rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher) {
        super('pytest', installer_1.Product.pytest, rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper);
        this.debugLauncher = debugLauncher;
    }
    discoverTestsImpl(ignoreCache) {
        const args = this.settings.unitTest.pyTestArgs.slice(0);
        return collector_1.discoverTests(this.rootDirectory, args, this.testDiscoveryCancellationToken, ignoreCache, this.outputChannel, this.testsHelper);
    }
    runTestImpl(tests, testsToRun, runFailedTests, debug) {
        const args = this.settings.unitTest.pyTestArgs.slice(0);
        if (runFailedTests === true && args.indexOf('--lf') === -1 && args.indexOf('--last-failed') === -1) {
            args.push('--last-failed');
        }
        return runner_1.runTest(this.testResultsService, this.debugLauncher, this.rootDirectory, tests, args, testsToRun, this.testRunnerCancellationToken, this.outputChannel, debug);
    }
}
exports.TestManager = TestManager;
//# sourceMappingURL=main.js.map