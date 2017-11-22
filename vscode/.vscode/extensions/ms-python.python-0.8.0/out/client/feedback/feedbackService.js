// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const os = require("os");
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
const constants_1 = require("../common/constants");
const constants_2 = require("../telemetry/constants");
const index_1 = require("../telemetry/index");
const counters_1 = require("./counters");
const FEEDBACK_URL = 'https://www.surveymonkey.com/r/293C9HY';
class FeedbackService {
    constructor(persistentStateFactory) {
        this.disposables = [];
        this.showFeedbackPrompt = persistentStateFactory.createGlobalPersistentState('SHOW_FEEDBACK_PROMPT', true);
        this.userResponded = persistentStateFactory.createGlobalPersistentState('RESPONDED_TO_FEEDBACK', false);
        if (this.showFeedbackPrompt.value && !this.userResponded.value) {
            this.initialize();
        }
    }
    get canShowPrompt() {
        return this.showFeedbackPrompt.value && !this.userResponded.value &&
            !this.promptDisplayed && this.counters !== undefined;
    }
    dispose() {
        this.counters = undefined;
        this.disposables.forEach(disposable => {
            // tslint:disable-next-line:no-unsafe-any
            disposable.dispose();
        });
        this.disposables = [];
    }
    initialize() {
        // tslint:disable-next-line:no-void-expression
        let commandDisable = vscode_2.commands.registerCommand('python.updateFeedbackCounter', (telemetryEventName) => this.updateFeedbackCounter(telemetryEventName));
        this.disposables.push(commandDisable);
        // tslint:disable-next-line:no-void-expression
        commandDisable = vscode_2.workspace.onDidChangeTextDocument(changeEvent => this.handleChangesToTextDocument(changeEvent.document), this, this.disposables);
        this.disposables.push(commandDisable);
        this.counters = new counters_1.FeedbackCounters();
        this.counters.on('thresholdReached', () => {
            this.thresholdHandler();
        });
    }
    handleChangesToTextDocument(textDocument) {
        if (textDocument.languageId !== constants_1.PythonLanguage.language) {
            return;
        }
        if (!this.canShowPrompt) {
            return;
        }
        this.counters.incrementEditCounter();
    }
    updateFeedbackCounter(telemetryEventName) {
        // Ignore feedback events.
        if (telemetryEventName === constants_2.FEEDBACK) {
            return;
        }
        if (!this.canShowPrompt) {
            return;
        }
        this.counters.incrementFeatureUsageCounter();
    }
    thresholdHandler() {
        if (!this.canShowPrompt) {
            return;
        }
        this.showPrompt();
    }
    showPrompt() {
        this.promptDisplayed = true;
        const message = 'Would you tell us how likely you are to recommend the Microsoft Python extension for VS Code to a friend or colleague?';
        const yesButton = 'Yes';
        const dontShowAgainButton = 'Don\'t Show Again';
        vscode_1.window.showInformationMessage(message, yesButton, dontShowAgainButton).then((value) => {
            switch (value) {
                case yesButton: {
                    this.displaySurvey();
                    break;
                }
                case dontShowAgainButton: {
                    this.doNotShowFeedbackAgain();
                    break;
                }
                default: {
                    index_1.sendTelemetryEvent(constants_2.FEEDBACK, undefined, { action: 'dismissed' });
                    break;
                }
            }
            // Stop everything for this session.
            this.dispose();
        });
    }
    displaySurvey() {
        this.userResponded.value = true;
        let openCommand;
        if (os.platform() === 'win32') {
            openCommand = 'explorer';
        }
        else if (os.platform() === 'darwin') {
            openCommand = '/usr/bin/open';
        }
        else {
            openCommand = '/usr/bin/xdg-open';
        }
        if (!openCommand) {
            console.error(`Unable to determine platform to capture user feedback in Python extension ${os.platform()}`);
            console.error(`Survey link is: ${FEEDBACK_URL}`);
        }
        child_process.spawn(openCommand, [FEEDBACK_URL]);
    }
    doNotShowFeedbackAgain() {
        this.showFeedbackPrompt.value = false;
    }
}
__decorate([
    index_1.captureTelemetry(constants_2.FEEDBACK, { action: 'accepted' })
], FeedbackService.prototype, "displaySurvey", null);
__decorate([
    index_1.captureTelemetry(constants_2.FEEDBACK, { action: 'doNotShowAgain' })
], FeedbackService.prototype, "doNotShowFeedbackAgain", null);
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedbackService.js.map