// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class StopWatch {
    constructor() {
        this.started = Date.now();
    }
    get elapsedTime() {
        return (this.stopped ? this.stopped : Date.now()) - this.started;
    }
    stop() {
        this.stopped = Date.now();
    }
}
exports.StopWatch = StopWatch;
//# sourceMappingURL=stopWatch.js.map