"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testManagerService_1 = require("./testManagerService");
class TestManagerServiceFactory {
    constructor(outChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher) {
        this.outChannel = outChannel;
        this.testCollectionStorage = testCollectionStorage;
        this.testResultsService = testResultsService;
        this.testsHelper = testsHelper;
        this.debugLauncher = debugLauncher;
    }
    createTestManagerService(wkspace) {
        return new testManagerService_1.TestManagerService(wkspace, this.outChannel, this.testCollectionStorage, this.testResultsService, this.testsHelper, this.debugLauncher);
    }
}
exports.TestManagerServiceFactory = TestManagerServiceFactory;
//# sourceMappingURL=testManagerServiceFactory.js.map