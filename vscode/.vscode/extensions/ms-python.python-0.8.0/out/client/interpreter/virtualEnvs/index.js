"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VirtualEnvironmentManager {
    constructor(envs) {
        this.envs = envs;
    }
    detect(pythonPath) {
        const promises = this.envs
            .map(item => item.detect(pythonPath)
            .then(result => {
            return { env: item, result };
        }));
        return Promise.all(promises)
            .then(results => {
            const env = results.find(items => items.result === true);
            return env ? env.env : undefined;
        });
    }
}
exports.VirtualEnvironmentManager = VirtualEnvironmentManager;
//# sourceMappingURL=index.js.map