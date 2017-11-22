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
const os = require("os");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const settings = require("./configSettings");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
var Product;
(function (Product) {
    Product[Product["pytest"] = 1] = "pytest";
    Product[Product["nosetest"] = 2] = "nosetest";
    Product[Product["pylint"] = 3] = "pylint";
    Product[Product["flake8"] = 4] = "flake8";
    Product[Product["pep8"] = 5] = "pep8";
    Product[Product["pylama"] = 6] = "pylama";
    Product[Product["prospector"] = 7] = "prospector";
    Product[Product["pydocstyle"] = 8] = "pydocstyle";
    Product[Product["yapf"] = 9] = "yapf";
    Product[Product["autopep8"] = 10] = "autopep8";
    Product[Product["mypy"] = 11] = "mypy";
    Product[Product["unittest"] = 12] = "unittest";
    Product[Product["ctags"] = 13] = "ctags";
    Product[Product["rope"] = 14] = "rope";
})(Product = exports.Product || (exports.Product = {}));
// tslint:disable-next-line:variable-name
const ProductInstallScripts = new Map();
ProductInstallScripts.set(Product.autopep8, ['-m', 'pip', 'install', 'autopep8']);
ProductInstallScripts.set(Product.flake8, ['-m', 'pip', 'install', 'flake8']);
ProductInstallScripts.set(Product.mypy, ['-m', 'pip', 'install', 'mypy']);
ProductInstallScripts.set(Product.nosetest, ['-m', 'pip', 'install', 'nose']);
ProductInstallScripts.set(Product.pep8, ['-m', 'pip', 'install', 'pep8']);
ProductInstallScripts.set(Product.pylama, ['-m', 'pip', 'install', 'pylama']);
ProductInstallScripts.set(Product.prospector, ['-m', 'pip', 'install', 'prospector']);
ProductInstallScripts.set(Product.pydocstyle, ['-m', 'pip', 'install', 'pydocstyle']);
ProductInstallScripts.set(Product.pylint, ['-m', 'pip', 'install', 'pylint']);
ProductInstallScripts.set(Product.pytest, ['-m', 'pip', 'install', '-U', 'pytest']);
ProductInstallScripts.set(Product.yapf, ['-m', 'pip', 'install', 'yapf']);
ProductInstallScripts.set(Product.rope, ['-m', 'pip', 'install', 'rope']);
// tslint:disable-next-line:variable-name
const ProductUninstallScripts = new Map();
ProductUninstallScripts.set(Product.autopep8, ['-m', 'pip', 'uninstall', 'autopep8', '--yes']);
ProductUninstallScripts.set(Product.flake8, ['-m', 'pip', 'uninstall', 'flake8', '--yes']);
ProductUninstallScripts.set(Product.mypy, ['-m', 'pip', 'uninstall', 'mypy', '--yes']);
ProductUninstallScripts.set(Product.nosetest, ['-m', 'pip', 'uninstall', 'nose', '--yes']);
ProductUninstallScripts.set(Product.pep8, ['-m', 'pip', 'uninstall', 'pep8', '--yes']);
ProductUninstallScripts.set(Product.pylama, ['-m', 'pip', 'uninstall', 'pylama', '--yes']);
ProductUninstallScripts.set(Product.prospector, ['-m', 'pip', 'uninstall', 'prospector', '--yes']);
ProductUninstallScripts.set(Product.pydocstyle, ['-m', 'pip', 'uninstall', 'pydocstyle', '--yes']);
ProductUninstallScripts.set(Product.pylint, ['-m', 'pip', 'uninstall', 'pylint', '--yes']);
ProductUninstallScripts.set(Product.pytest, ['-m', 'pip', 'uninstall', 'pytest', '--yes']);
ProductUninstallScripts.set(Product.yapf, ['-m', 'pip', 'uninstall', 'yapf', '--yes']);
ProductUninstallScripts.set(Product.rope, ['-m', 'pip', 'uninstall', 'rope', '--yes']);
// tslint:disable-next-line:variable-name
exports.ProductExecutableAndArgs = new Map();
exports.ProductExecutableAndArgs.set(Product.mypy, { executable: 'python', args: ['-m', 'mypy'] });
exports.ProductExecutableAndArgs.set(Product.nosetest, { executable: 'python', args: ['-m', 'nose'] });
exports.ProductExecutableAndArgs.set(Product.pylama, { executable: 'python', args: ['-m', 'pylama'] });
exports.ProductExecutableAndArgs.set(Product.prospector, { executable: 'python', args: ['-m', 'prospector'] });
exports.ProductExecutableAndArgs.set(Product.pylint, { executable: 'python', args: ['-m', 'pylint'] });
exports.ProductExecutableAndArgs.set(Product.pytest, { executable: 'python', args: ['-m', 'pytest'] });
exports.ProductExecutableAndArgs.set(Product.autopep8, { executable: 'python', args: ['-m', 'autopep8'] });
exports.ProductExecutableAndArgs.set(Product.pep8, { executable: 'python', args: ['-m', 'pep8'] });
exports.ProductExecutableAndArgs.set(Product.pydocstyle, { executable: 'python', args: ['-m', 'pydocstyle'] });
exports.ProductExecutableAndArgs.set(Product.yapf, { executable: 'python', args: ['-m', 'yapf'] });
exports.ProductExecutableAndArgs.set(Product.flake8, { executable: 'python', args: ['-m', 'flake8'] });
switch (os.platform()) {
    case 'win32': {
        // Nothing
        break;
    }
    case 'darwin': {
        ProductInstallScripts.set(Product.ctags, ['brew install ctags']);
    }
    default: {
        ProductInstallScripts.set(Product.ctags, ['sudo apt-get install exuberant-ctags']);
    }
}
// tslint:disable-next-line:variable-name
exports.Linters = [
    Product.flake8,
    Product.pep8,
    Product.pylama,
    Product.prospector,
    Product.pylint,
    Product.mypy,
    Product.pydocstyle
];
// tslint:disable-next-line:variable-name
const ProductNames = new Map();
ProductNames.set(Product.autopep8, 'autopep8');
ProductNames.set(Product.flake8, 'flake8');
ProductNames.set(Product.mypy, 'mypy');
ProductNames.set(Product.nosetest, 'nosetest');
ProductNames.set(Product.pep8, 'pep8');
ProductNames.set(Product.pylama, 'pylama');
ProductNames.set(Product.prospector, 'prospector');
ProductNames.set(Product.pydocstyle, 'pydocstyle');
ProductNames.set(Product.pylint, 'pylint');
ProductNames.set(Product.pytest, 'py.test');
ProductNames.set(Product.yapf, 'yapf');
ProductNames.set(Product.rope, 'rope');
// tslint:disable-next-line:variable-name
exports.SettingToDisableProduct = new Map();
exports.SettingToDisableProduct.set(Product.flake8, 'linting.flake8Enabled');
exports.SettingToDisableProduct.set(Product.mypy, 'linting.mypyEnabled');
exports.SettingToDisableProduct.set(Product.nosetest, 'unitTest.nosetestsEnabled');
exports.SettingToDisableProduct.set(Product.pep8, 'linting.pep8Enabled');
exports.SettingToDisableProduct.set(Product.pylama, 'linting.pylamaEnabled');
exports.SettingToDisableProduct.set(Product.prospector, 'linting.prospectorEnabled');
exports.SettingToDisableProduct.set(Product.pydocstyle, 'linting.pydocstyleEnabled');
exports.SettingToDisableProduct.set(Product.pylint, 'linting.pylintEnabled');
exports.SettingToDisableProduct.set(Product.pytest, 'unitTest.pyTestEnabled');
// tslint:disable-next-line:variable-name
const ProductInstallationPrompt = new Map();
ProductInstallationPrompt.set(Product.ctags, 'Install CTags to enable Python workspace symbols');
var ProductType;
(function (ProductType) {
    ProductType[ProductType["Linter"] = 0] = "Linter";
    ProductType[ProductType["Formatter"] = 1] = "Formatter";
    ProductType[ProductType["TestFramework"] = 2] = "TestFramework";
    ProductType[ProductType["RefactoringLibrary"] = 3] = "RefactoringLibrary";
    ProductType[ProductType["WorkspaceSymbols"] = 4] = "WorkspaceSymbols";
})(ProductType || (ProductType = {}));
// tslint:disable-next-line:variable-name
const ProductTypeNames = new Map();
ProductTypeNames.set(ProductType.Formatter, 'Formatter');
ProductTypeNames.set(ProductType.Linter, 'Linter');
ProductTypeNames.set(ProductType.RefactoringLibrary, 'Refactoring library');
ProductTypeNames.set(ProductType.TestFramework, 'Test Framework');
ProductTypeNames.set(ProductType.WorkspaceSymbols, 'Workspace Symbols');
// tslint:disable-next-line:variable-name
const ProductTypes = new Map();
ProductTypes.set(Product.flake8, ProductType.Linter);
ProductTypes.set(Product.mypy, ProductType.Linter);
ProductTypes.set(Product.pep8, ProductType.Linter);
ProductTypes.set(Product.prospector, ProductType.Linter);
ProductTypes.set(Product.pydocstyle, ProductType.Linter);
ProductTypes.set(Product.pylama, ProductType.Linter);
ProductTypes.set(Product.pylint, ProductType.Linter);
ProductTypes.set(Product.ctags, ProductType.WorkspaceSymbols);
ProductTypes.set(Product.nosetest, ProductType.TestFramework);
ProductTypes.set(Product.pytest, ProductType.TestFramework);
ProductTypes.set(Product.unittest, ProductType.TestFramework);
ProductTypes.set(Product.autopep8, ProductType.Formatter);
ProductTypes.set(Product.yapf, ProductType.Formatter);
ProductTypes.set(Product.rope, ProductType.RefactoringLibrary);
const IS_POWERSHELL = /powershell.exe$/i;
var InstallerResponse;
(function (InstallerResponse) {
    InstallerResponse[InstallerResponse["Installed"] = 0] = "Installed";
    InstallerResponse[InstallerResponse["Disabled"] = 1] = "Disabled";
    InstallerResponse[InstallerResponse["Ignore"] = 2] = "Ignore";
})(InstallerResponse = exports.InstallerResponse || (exports.InstallerResponse = {}));
class Installer {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.disposables = [];
        this.disposables.push(vscode.window.onDidCloseTerminal(term => {
            if (term === Installer.terminal) {
                Installer.terminal = null;
            }
        }));
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    shouldDisplayPrompt(product) {
        // tslint:disable-next-line:no-non-null-assertion
        const productName = ProductNames.get(product);
        const pythonConfig = vscode_1.workspace.getConfiguration('python');
        // tslint:disable-next-line:prefer-type-cast
        const disablePromptForFeatures = pythonConfig.get('disablePromptForFeatures', []);
        return disablePromptForFeatures.indexOf(productName) === -1;
    }
    // tslint:disable-next-line:member-ordering
    promptToInstall(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line:no-non-null-assertion
            const productType = ProductTypes.get(product);
            // tslint:disable-next-line:no-non-null-assertion
            const productTypeName = ProductTypeNames.get(productType);
            // tslint:disable-next-line:no-non-null-assertion
            const productName = ProductNames.get(product);
            if (!this.shouldDisplayPrompt(product)) {
                const message = `${productTypeName} '${productName}' not installed.`;
                if (this.outputChannel) {
                    this.outputChannel.appendLine(message);
                }
                else {
                    console.warn(message);
                }
                return InstallerResponse.Ignore;
            }
            const installOption = ProductInstallationPrompt.has(product) ? ProductInstallationPrompt.get(product) : `Install ${productName}`;
            const disableOption = `Disable ${productTypeName}`;
            const dontShowAgain = 'Don\'t show this prompt again';
            const alternateFormatter = product === Product.autopep8 ? 'yapf' : 'autopep8';
            const useOtherFormatter = `Use '${alternateFormatter}' formatter`;
            const options = [];
            options.push(installOption);
            if (productType === ProductType.Formatter) {
                options.push(...[useOtherFormatter]);
            }
            if (exports.SettingToDisableProduct.has(product)) {
                options.push(...[disableOption, dontShowAgain]);
            }
            const item = yield vscode_1.window.showErrorMessage(`${productTypeName} ${productName} is not installed`, ...options);
            switch (item) {
                case installOption: {
                    return this.install(product, resource);
                }
                case disableOption: {
                    if (exports.Linters.indexOf(product) >= 0) {
                        return this.disableLinter(product, resource).then(() => InstallerResponse.Disabled);
                    }
                    else {
                        // tslint:disable-next-line:no-non-null-assertion
                        const settingToDisable = exports.SettingToDisableProduct.get(product);
                        return this.updateSetting(settingToDisable, false, resource).then(() => InstallerResponse.Disabled);
                    }
                }
                case useOtherFormatter: {
                    return this.updateSetting('formatting.provider', alternateFormatter, resource)
                        .then(() => InstallerResponse.Installed);
                }
                case dontShowAgain: {
                    const pythonConfig = vscode_1.workspace.getConfiguration('python');
                    // tslint:disable-next-line:prefer-type-cast
                    const features = pythonConfig.get('disablePromptForFeatures', []);
                    features.push(productName);
                    return pythonConfig.update('disablePromptForFeatures', features, true).then(() => InstallerResponse.Ignore);
                }
                default: {
                    throw new Error('Invalid selection');
                }
            }
        });
    }
    // tslint:disable-next-line:member-ordering
    install(product, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.outputChannel && !Installer.terminal) {
                Installer.terminal = vscode_1.window.createTerminal('Python Installer');
            }
            if (product === Product.ctags && settings.IS_WINDOWS) {
                if (this.outputChannel) {
                    this.outputChannel.appendLine('Install Universal Ctags Win32 to enable support for Workspace Symbols');
                    this.outputChannel.appendLine('Download the CTags binary from the Universal CTags site.');
                    this.outputChannel.appendLine('Option 1: Extract ctags.exe from the downloaded zip to any folder within your PATH so that Visual Studio Code can run it.');
                    this.outputChannel.appendLine('Option 2: Extract to any folder and add the path to this folder to the command setting.');
                    this.outputChannel.appendLine('Option 3: Extract to any folder and define that path in the python.workspaceSymbols.ctagsPath setting of your user settings file (settings.json).');
                    this.outputChannel.show();
                }
                else {
                    vscode_1.window.showInformationMessage('Install Universal Ctags and set it in your path or define the path in your python.workspaceSymbols.ctagsPath settings');
                }
                return InstallerResponse.Ignore;
            }
            // tslint:disable-next-line:no-non-null-assertion
            let installArgs = ProductInstallScripts.get(product);
            const pipIndex = installArgs.indexOf('pip');
            if (pipIndex > 0) {
                installArgs = installArgs.slice();
                const proxy = vscode.workspace.getConfiguration('http').get('proxy', '');
                if (proxy.length > 0) {
                    installArgs.splice(2, 0, proxy);
                    installArgs.splice(2, 0, '--proxy');
                }
            }
            // tslint:disable-next-line:no-any
            let installationPromise;
            if (this.outputChannel && installArgs[0] === '-m') {
                // Errors are just displayed to the user
                this.outputChannel.show();
                installationPromise = utils_1.execPythonFile(resource, settings.PythonSettings.getInstance(resource).pythonPath, 
                // tslint:disable-next-line:no-non-null-assertion
                installArgs, getCwdForInstallScript(resource), true, (data) => { this.outputChannel.append(data); });
            }
            else {
                // When using terminal get the fully qualitified path
                // Cuz people may launch vs code from terminal when they have activated the appropriate virtual env
                // Problem is terminal doesn't use the currently activated virtual env
                // Must have something to do with the process being launched in the terminal
                installationPromise = utils_1.getFullyQualifiedPythonInterpreterPath(resource)
                    .then(pythonPath => {
                    let installScript = installArgs.join(' ');
                    if (installArgs[0] === '-m') {
                        if (pythonPath.indexOf(' ') >= 0) {
                            installScript = `"${pythonPath}" ${installScript}`;
                        }
                        else {
                            installScript = `${pythonPath} ${installScript}`;
                        }
                    }
                    if (this.terminalIsPowershell(resource)) {
                        installScript = `& ${installScript}`;
                    }
                    // tslint:disable-next-line:no-non-null-assertion
                    Installer.terminal.sendText(installScript);
                    // tslint:disable-next-line:no-non-null-assertion
                    Installer.terminal.show(false);
                });
            }
            return installationPromise
                .then(() => this.isInstalled(product))
                .then(isInstalled => isInstalled ? InstallerResponse.Installed : InstallerResponse.Ignore);
        });
    }
    // tslint:disable-next-line:member-ordering
    isInstalled(product, resource) {
        return isProductInstalled(product, resource);
    }
    // tslint:disable-next-line:member-ordering no-any
    uninstall(product, resource) {
        return uninstallproduct(product, resource);
    }
    // tslint:disable-next-line:member-ordering
    disableLinter(product, resource) {
        if (resource && !vscode_1.workspace.getWorkspaceFolder(resource)) {
            // tslint:disable-next-line:no-non-null-assertion
            const settingToDisable = exports.SettingToDisableProduct.get(product);
            const pythonConfig = vscode_1.workspace.getConfiguration('python', resource);
            return pythonConfig.update(settingToDisable, false, vscode_1.ConfigurationTarget.Workspace);
        }
        else {
            const pythonConfig = vscode_1.workspace.getConfiguration('python');
            return pythonConfig.update('linting.enabledWithoutWorkspace', false, true);
        }
    }
    terminalIsPowershell(resource) {
        if (!utils_1.IS_WINDOWS) {
            return false;
        }
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const terminal = vscode_1.workspace.getConfiguration('terminal.integrated.shell', resource).get('windows');
        return typeof terminal === 'string' && IS_POWERSHELL.test(terminal);
    }
    // tslint:disable-next-line:no-any
    updateSetting(setting, value, resource) {
        if (resource && !vscode_1.workspace.getWorkspaceFolder(resource)) {
            const pythonConfig = vscode_1.workspace.getConfiguration('python', resource);
            return pythonConfig.update(setting, value, vscode_1.ConfigurationTarget.Workspace);
        }
        else {
            const pythonConfig = vscode_1.workspace.getConfiguration('python');
            return pythonConfig.update(setting, value, true);
        }
    }
}
exports.Installer = Installer;
function getCwdForInstallScript(resource) {
    const workspaceFolder = resource ? vscode_1.workspace.getWorkspaceFolder(resource) : undefined;
    if (workspaceFolder) {
        return workspaceFolder.uri.fsPath;
    }
    if (Array.isArray(vscode_1.workspace.workspaceFolders) && vscode_1.workspace.workspaceFolders.length > 0) {
        return vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    return __dirname;
}
function isProductInstalled(product, resource) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.ProductExecutableAndArgs.has(product)) {
            return;
        }
        // tslint:disable-next-line:no-non-null-assertion
        const prodExec = exports.ProductExecutableAndArgs.get(product);
        const cwd = getCwdForInstallScript(resource);
        return utils_1.execPythonFile(resource, prodExec.executable, prodExec.args.concat(['--version']), cwd, false)
            .then(() => true)
            .catch(reason => !helpers_1.isNotInstalledError(reason));
    });
}
// tslint:disable-next-line:no-any
function uninstallproduct(product, resource) {
    if (!ProductUninstallScripts.has(product)) {
        return Promise.resolve();
    }
    // tslint:disable-next-line:no-non-null-assertion
    const uninstallArgs = ProductUninstallScripts.get(product);
    return utils_1.execPythonFile(resource, 'python', uninstallArgs, getCwdForInstallScript(resource), false);
}
//# sourceMappingURL=installer.js.map