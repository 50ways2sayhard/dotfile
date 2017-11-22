"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configSettings_1 = require("../../common/configSettings");
const installer_1 = require("../../common/installer");
const main_1 = require("../nosetest/main");
const main_2 = require("../pytest/main");
const main_3 = require("../unittest/main");
class TestManagerService {
    constructor(wkspace, outChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher) {
        this.wkspace = wkspace;
        this.outChannel = outChannel;
        this.testManagers = new Map();
        this.testManagers.set(installer_1.Product.nosetest, {
            create: (rootDirectory) => new main_1.TestManager(rootDirectory, this.outChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher)
        });
        this.testManagers.set(installer_1.Product.pytest, {
            create: (rootDirectory) => new main_2.TestManager(rootDirectory, this.outChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher)
        });
        this.testManagers.set(installer_1.Product.unittest, {
            create: (rootDirectory) => new main_3.TestManager(rootDirectory, this.outChannel, testCollectionStorage, testResultsService, testsHelper, debugLauncher)
        });
    }
    dispose() {
        this.testManagers.forEach(info => {
            if (info.instance) {
                info.instance.dispose();
            }
        });
    }
    getTestManager() {
        const preferredTestManager = this.getPreferredTestManager();
        if (typeof preferredTestManager !== 'number') {
            return;
        }
        // tslint:disable-next-line:no-non-null-assertion
        const info = this.testManagers.get(preferredTestManager);
        if (!info.instance) {
            const testDirectory = this.getTestWorkingDirectory();
            info.instance = info.create(testDirectory);
        }
        return info.instance;
    }
    getTestWorkingDirectory() {
        const settings = configSettings_1.PythonSettings.getInstance(this.wkspace);
        return settings.unitTest.cwd && settings.unitTest.cwd.length > 0 ? settings.unitTest.cwd : this.wkspace.fsPath;
    }
    getPreferredTestManager() {
        const settings = configSettings_1.PythonSettings.getInstance(this.wkspace);
        if (settings.unitTest.nosetestsEnabled) {
            return installer_1.Product.nosetest;
        }
        else if (settings.unitTest.pyTestEnabled) {
            return installer_1.Product.pytest;
        }
        else if (settings.unitTest.unittestEnabled) {
            return installer_1.Product.unittest;
        }
        return undefined;
    }
}
exports.TestManagerService = TestManagerService;
//# sourceMappingURL=testManagerService.js.map