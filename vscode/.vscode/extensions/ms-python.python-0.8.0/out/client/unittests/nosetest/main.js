'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const installer_1 = require("../../common/installer");
const baseTestManager_1 = require("../common/baseTestManager");
const collector_1 = require("./collector");
const runner_1 = require("./runner");
class TestManager extends baseTestManager_1.BaseTestManager {
    constructor(rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher) {
        super('nosetest', installer_1.Product.nosetest, rootDirectory, outputChannel, testCollectionStorage, testResultsService, testsHelper);
        this.debugLauncher = debugLauncher;
    }
    discoverTestsImpl(ignoreCache) {
        const args = this.settings.unitTest.nosetestArgs.slice(0);
        return collector_1.discoverTests(this.rootDirectory, args, this.testDiscoveryCancellationToken, ignoreCache, this.outputChannel, this.testsHelper);
    }
    // tslint:disable-next-line:no-any
    runTestImpl(tests, testsToRun, runFailedTests, debug) {
        const args = this.settings.unitTest.nosetestArgs.slice(0);
        if (runFailedTests === true && args.indexOf('--failed') === -1) {
            args.push('--failed');
        }
        if (!runFailedTests && args.indexOf('--with-id') === -1) {
            args.push('--with-id');
        }
        return runner_1.runTest(this.testResultsService, this.debugLauncher, this.rootDirectory, tests, args, testsToRun, this.testRunnerCancellationToken, this.outputChannel, debug);
    }
}
exports.TestManager = TestManager;
//# sourceMappingURL=main.js.map