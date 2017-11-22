// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class PersistentState {
    constructor(storage, key, defaultValue) {
        this.storage = storage;
        this.key = key;
        this.defaultValue = defaultValue;
    }
    get value() {
        return this.storage.get(this.key, this.defaultValue);
    }
    set value(newValue) {
        this.storage.update(this.key, newValue);
    }
}
exports.PersistentState = PersistentState;
class PersistentStateFactory {
    constructor(globalState, workspaceState) {
        this.globalState = globalState;
        this.workspaceState = workspaceState;
    }
    createGlobalPersistentState(key, defaultValue) {
        return new PersistentState(this.globalState, key, defaultValue);
    }
    createWorkspacePersistentState(key, defaultValue) {
        return new PersistentState(this.workspaceState, key, defaultValue);
    }
}
exports.PersistentStateFactory = PersistentStateFactory;
//# sourceMappingURL=persistentState.js.map