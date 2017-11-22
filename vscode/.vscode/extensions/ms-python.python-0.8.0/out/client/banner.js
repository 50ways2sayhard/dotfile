// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const os = require("os");
const vscode_1 = require("vscode");
const BANNER_URL = 'https://aka.ms/pvsc-at-msft';
class BannerService {
    constructor(persistentStateFactory) {
        this.shouldShowBanner = persistentStateFactory.createGlobalPersistentState('SHOW_NEW_PUBLISHER_BANNER', true);
        this.showBanner();
    }
    showBanner() {
        if (!this.shouldShowBanner.value) {
            return;
        }
        this.shouldShowBanner.value = false;
        const message = 'The Python extension is now published by Microsoft!';
        const yesButton = 'Read more';
        vscode_1.window.showInformationMessage(message, yesButton).then((value) => {
            if (value === yesButton) {
                this.displayBanner();
            }
        });
    }
    displayBanner() {
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
            console.error(`Unable open ${BANNER_URL} on platform '${os.platform()}'.`);
        }
        child_process.spawn(openCommand, [BANNER_URL]);
    }
}
exports.BannerService = BannerService;
//# sourceMappingURL=banner.js.map