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
const os = require("os");
const vscode = require("vscode");
const banner_1 = require("./banner");
const settings = require("./common/configSettings");
const helpers_1 = require("./common/helpers");
const persistentState_1 = require("./common/persistentState");
const debugger_1 = require("./debugger");
const feedback_1 = require("./feedback");
const interpreter_1 = require("./interpreter");
const setInterpreterProvider_1 = require("./interpreter/configuration/setInterpreterProvider");
const shebangCodeLensProvider_1 = require("./interpreter/display/shebangCodeLensProvider");
const helpers_2 = require("./interpreter/helpers");
const interpreterVersion_1 = require("./interpreter/interpreterVersion");
const jup = require("./jupyter/main");
const provider_1 = require("./jupyter/provider");
const jediProxyFactory_1 = require("./languageServices/jediProxyFactory");
const completionProvider_1 = require("./providers/completionProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const execInTerminalProvider_1 = require("./providers/execInTerminalProvider");
const formatOnSaveProvider_1 = require("./providers/formatOnSaveProvider");
const formatProvider_1 = require("./providers/formatProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const lintProvider_1 = require("./providers/lintProvider");
const objectDefinitionProvider_1 = require("./providers/objectDefinitionProvider");
const referenceProvider_1 = require("./providers/referenceProvider");
const renameProvider_1 = require("./providers/renameProvider");
const replProvider_1 = require("./providers/replProvider");
const signatureProvider_1 = require("./providers/signatureProvider");
const simpleRefactorProvider_1 = require("./providers/simpleRefactorProvider");
const symbolProvider_1 = require("./providers/symbolProvider");
const updateSparkLibraryProvider_1 = require("./providers/updateSparkLibraryProvider");
const sortImports = require("./sortImports");
const telemetry_1 = require("./telemetry");
const constants_1 = require("./telemetry/constants");
const stopWatch_1 = require("./telemetry/stopWatch");
const blockFormatProvider_1 = require("./typeFormatters/blockFormatProvider");
const tests = require("./unittests/main");
const main_1 = require("./workspaceSymbols/main");
const PYTHON = { language: 'python' };
let unitTestOutChannel;
let formatOutChannel;
let lintingOutChannel;
let jupMain;
const activationDeferred = helpers_1.createDeferred();
exports.activated = activationDeferred.promise;
// tslint:disable-next-line:max-func-body-length
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonSettings = settings.PythonSettings.getInstance();
        // tslint:disable-next-line:no-floating-promises
        sendStartupTelemetry(exports.activated);
        lintingOutChannel = vscode.window.createOutputChannel(pythonSettings.linting.outputWindow);
        formatOutChannel = lintingOutChannel;
        if (pythonSettings.linting.outputWindow !== pythonSettings.formatting.outputWindow) {
            formatOutChannel = vscode.window.createOutputChannel(pythonSettings.formatting.outputWindow);
            formatOutChannel.clear();
        }
        if (pythonSettings.linting.outputWindow !== pythonSettings.unitTest.outputWindow) {
            unitTestOutChannel = vscode.window.createOutputChannel(pythonSettings.unitTest.outputWindow);
            unitTestOutChannel.clear();
        }
        sortImports.activate(context, formatOutChannel);
        const interpreterManager = new interpreter_1.InterpreterManager();
        yield interpreterManager.autoSetInterpreter();
        // tslint:disable-next-line:no-floating-promises
        interpreterManager.refresh();
        context.subscriptions.push(interpreterManager);
        const interpreterVersionService = new interpreterVersion_1.InterpreterVersionService();
        context.subscriptions.push(new setInterpreterProvider_1.SetInterpreterProvider(interpreterManager, interpreterVersionService));
        context.subscriptions.push(...execInTerminalProvider_1.activateExecInTerminalProvider());
        context.subscriptions.push(updateSparkLibraryProvider_1.activateUpdateSparkLibraryProvider());
        simpleRefactorProvider_1.activateSimplePythonRefactorProvider(context, formatOutChannel);
        context.subscriptions.push(formatOnSaveProvider_1.activateFormatOnSaveProvider(PYTHON, formatOutChannel));
        const jediFactory = new jediProxyFactory_1.JediFactory(context.asAbsolutePath('.'));
        context.subscriptions.push(...objectDefinitionProvider_1.activateGoToObjectDefinitionProvider(jediFactory));
        context.subscriptions.push(new replProvider_1.ReplProvider());
        // Enable indentAction
        // tslint:disable-next-line:no-non-null-assertion
        vscode.languages.setLanguageConfiguration(PYTHON.language, {
            onEnterRules: [
                {
                    beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                    action: { indentAction: vscode.IndentAction.Indent }
                },
                {
                    beforeText: /^ *#.*$/,
                    afterText: /.+$/,
                    action: { indentAction: vscode.IndentAction.None, appendText: '# ' }
                },
                {
                    beforeText: /^\s+(continue|break|return)\b.*$/,
                    action: { indentAction: vscode.IndentAction.Outdent }
                }
            ]
        });
        context.subscriptions.push(jediFactory);
        context.subscriptions.push(vscode.languages.registerRenameProvider(PYTHON, new renameProvider_1.PythonRenameProvider(formatOutChannel)));
        const definitionProvider = new definitionProvider_1.PythonDefinitionProvider(jediFactory);
        context.subscriptions.push(vscode.languages.registerDefinitionProvider(PYTHON, definitionProvider));
        context.subscriptions.push(vscode.languages.registerHoverProvider(PYTHON, new hoverProvider_1.PythonHoverProvider(jediFactory)));
        context.subscriptions.push(vscode.languages.registerReferenceProvider(PYTHON, new referenceProvider_1.PythonReferenceProvider(jediFactory)));
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(PYTHON, new completionProvider_1.PythonCompletionItemProvider(jediFactory), '.'));
        context.subscriptions.push(vscode.languages.registerCodeLensProvider(PYTHON, new shebangCodeLensProvider_1.ShebangCodeLensProvider()));
        const symbolProvider = new symbolProvider_1.PythonSymbolProvider(jediFactory);
        context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(PYTHON, symbolProvider));
        if (pythonSettings.devOptions.indexOf('DISABLE_SIGNATURE') === -1) {
            context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(PYTHON, new signatureProvider_1.PythonSignatureProvider(jediFactory), '(', ','));
        }
        if (pythonSettings.formatting.provider !== 'none') {
            const formatProvider = new formatProvider_1.PythonFormattingEditProvider(context, formatOutChannel);
            context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(PYTHON, formatProvider));
            context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(PYTHON, formatProvider));
        }
        const jupyterExtInstalled = vscode.extensions.getExtension('donjayamanne.jupyter');
        // tslint:disable-next-line:promise-function-async
        const linterProvider = new lintProvider_1.LintProvider(context, lintingOutChannel, (a, b) => Promise.resolve(false));
        context.subscriptions.push();
        if (jupyterExtInstalled) {
            if (jupyterExtInstalled.isActive) {
                // tslint:disable-next-line:no-unsafe-any
                jupyterExtInstalled.exports.registerLanguageProvider(PYTHON.language, new provider_1.JupyterProvider());
                // tslint:disable-next-line:no-unsafe-any
                linterProvider.documentHasJupyterCodeCells = jupyterExtInstalled.exports.hasCodeCells;
            }
            jupyterExtInstalled.activate().then(() => {
                // tslint:disable-next-line:no-unsafe-any
                jupyterExtInstalled.exports.registerLanguageProvider(PYTHON.language, new provider_1.JupyterProvider());
                // tslint:disable-next-line:no-unsafe-any
                linterProvider.documentHasJupyterCodeCells = jupyterExtInstalled.exports.hasCodeCells;
            });
        }
        else {
            jupMain = new jup.Jupyter(lintingOutChannel);
            const documentHasJupyterCodeCells = jupMain.hasCodeCells.bind(jupMain);
            jupMain.activate();
            context.subscriptions.push(jupMain);
            // tslint:disable-next-line:no-unsafe-any
            linterProvider.documentHasJupyterCodeCells = documentHasJupyterCodeCells;
        }
        tests.activate(context, unitTestOutChannel, symbolProvider);
        context.subscriptions.push(new main_1.WorkspaceSymbols(lintingOutChannel));
        context.subscriptions.push(vscode.languages.registerOnTypeFormattingEditProvider(PYTHON, new blockFormatProvider_1.BlockFormatProviders(), ':'));
        // In case we have CR LF
        const triggerCharacters = os.EOL.split('');
        triggerCharacters.shift();
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('python', new debugger_1.SimpleConfigurationProvider()));
        activationDeferred.resolve();
        const persistentStateFactory = new persistentState_1.PersistentStateFactory(context.globalState, context.workspaceState);
        const feedbackService = new feedback_1.FeedbackService(persistentStateFactory);
        context.subscriptions.push(feedbackService);
        // tslint:disable-next-line:no-unused-expression
        new banner_1.BannerService(persistentStateFactory);
    });
}
exports.activate = activate;
function sendStartupTelemetry(activatedPromise) {
    return __awaiter(this, void 0, void 0, function* () {
        const stopWatch = new stopWatch_1.StopWatch();
        // tslint:disable-next-line:no-floating-promises
        activatedPromise.then(() => __awaiter(this, void 0, void 0, function* () {
            const duration = stopWatch.elapsedTime;
            let condaVersion;
            try {
                condaVersion = yield helpers_2.getCondaVersion();
                // tslint:disable-next-line:no-empty
            }
            catch (_a) { }
            const props = condaVersion ? { condaVersion } : undefined;
            telemetry_1.sendTelemetryEvent(constants_1.EDITOR_LOAD, duration, props);
        }));
    });
}
//# sourceMappingURL=extension.js.map