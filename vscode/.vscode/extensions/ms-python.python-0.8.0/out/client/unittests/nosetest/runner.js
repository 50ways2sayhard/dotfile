'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
const configSettings_1 = require("../../common/configSettings");
const helpers_1 = require("../../common/helpers");
const runner_1 = require("../common/runner");
const xUnitParser_1 = require("../common/xUnitParser");
const WITH_XUNIT = '--with-xunit';
const XUNIT_FILE = '--xunit-file';
// tslint:disable-next-line:no-any
function runTest(testResultsService, debugLauncher, rootDirectory, tests, args, testsToRun, token, outChannel, debug) {
    let testPaths = [];
    if (testsToRun && testsToRun.testFolder) {
        testPaths = testPaths.concat(testsToRun.testFolder.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testFile) {
        testPaths = testPaths.concat(testsToRun.testFile.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testSuite) {
        testPaths = testPaths.concat(testsToRun.testSuite.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testFunction) {
        testPaths = testPaths.concat(testsToRun.testFunction.map(f => f.nameToRun));
    }
    let xmlLogFile = '';
    // tslint:disable-next-line:no-empty
    let xmlLogFileCleanup = () => { };
    // Check if '--with-xunit' is in args list
    const noseTestArgs = args.slice();
    if (noseTestArgs.indexOf(WITH_XUNIT) === -1) {
        noseTestArgs.push(WITH_XUNIT);
    }
    // Check if '--xunit-file' exists, if not generate random xml file
    const indexOfXUnitFile = noseTestArgs.findIndex(value => value.indexOf(XUNIT_FILE) === 0);
    let promiseToGetXmlLogFile;
    if (indexOfXUnitFile === -1) {
        promiseToGetXmlLogFile = helpers_1.createTemporaryFile('.xml').then(xmlLogResult => {
            xmlLogFileCleanup = xmlLogResult.cleanupCallback;
            xmlLogFile = xmlLogResult.filePath;
            noseTestArgs.push(`${XUNIT_FILE}=${xmlLogFile}`);
            return xmlLogResult.filePath;
        });
    }
    else {
        if (noseTestArgs[indexOfXUnitFile].indexOf('=') === -1) {
            xmlLogFile = noseTestArgs[indexOfXUnitFile + 1];
        }
        else {
            xmlLogFile = noseTestArgs[indexOfXUnitFile].substring(noseTestArgs[indexOfXUnitFile].indexOf('=') + 1).trim();
        }
        promiseToGetXmlLogFile = Promise.resolve(xmlLogFile);
    }
    return promiseToGetXmlLogFile.then(() => {
        const pythonSettings = configSettings_1.PythonSettings.getInstance(vscode_1.Uri.file(rootDirectory));
        if (debug === true) {
            const testLauncherFile = path.join(__dirname, '..', '..', '..', '..', 'pythonFiles', 'PythonTools', 'testlauncher.py');
            const nosetestlauncherargs = [rootDirectory, 'my_secret', pythonSettings.unitTest.debugPort.toString(), 'nose'];
            const debuggerArgs = [testLauncherFile].concat(nosetestlauncherargs).concat(noseTestArgs.concat(testPaths));
            // tslint:disable-next-line:prefer-type-cast no-any
            return debugLauncher.launchDebugger(rootDirectory, debuggerArgs, token, outChannel);
        }
        else {
            // tslint:disable-next-line:prefer-type-cast no-any
            return runner_1.run(pythonSettings.unitTest.nosetestPath, noseTestArgs.concat(testPaths), rootDirectory, token, outChannel);
        }
    }).then(() => {
        return updateResultsFromLogFiles(tests, xmlLogFile, testResultsService);
    }).then(result => {
        xmlLogFileCleanup();
        return result;
    }).catch(reason => {
        xmlLogFileCleanup();
        return Promise.reject(reason);
    });
}
exports.runTest = runTest;
// tslint:disable-next-line:no-any
function updateResultsFromLogFiles(tests, outputXmlFile, testResultsService) {
    return xUnitParser_1.updateResultsFromXmlLogFile(tests, outputXmlFile, xUnitParser_1.PassCalculationFormulae.nosetests).then(() => {
        testResultsService.updateResults(tests);
        return tests;
    });
}
exports.updateResultsFromLogFiles = updateResultsFromLogFiles;
//# sourceMappingURL=runner.js.map