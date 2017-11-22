'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const utils_1 = require("../../../common/utils");
const helpers_1 = require("../helpers");
// tslint:disable-next-line:no-require-imports no-var-requires
const untildify = require('untildify');
class KnownPathsService {
    constructor(knownSearchPaths, versionProvider) {
        this.knownSearchPaths = knownSearchPaths;
        this.versionProvider = versionProvider;
    }
    // tslint:disable-next-line:no-shadowed-variable
    getInterpreters(_) {
        return this.suggestionsFromKnownPaths();
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    suggestionsFromKnownPaths() {
        const promises = this.knownSearchPaths.map(dir => this.getInterpretersInDirectory(dir));
        return Promise.all(promises)
            .then(listOfInterpreters => _.flatten(listOfInterpreters))
            .then(interpreters => interpreters.filter(item => item.length > 0))
            .then(interpreters => Promise.all(interpreters.map(interpreter => this.getInterpreterDetails(interpreter))));
    }
    getInterpreterDetails(interpreter) {
        return this.versionProvider.getVersion(interpreter, path.basename(interpreter))
            .then(displayName => {
            return {
                displayName,
                path: interpreter
            };
        });
    }
    getInterpretersInDirectory(dir) {
        return utils_1.fsExistsAsync(dir)
            .then(exists => exists ? helpers_1.lookForInterpretersInDirectory(dir) : Promise.resolve([]));
    }
}
exports.KnownPathsService = KnownPathsService;
function getKnownSearchPathsForInterpreters() {
    if (utils_1.IS_WINDOWS) {
        return [];
    }
    else {
        const paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/sbin'];
        paths.forEach(p => {
            paths.push(untildify(`~${p}`));
        });
        // Add support for paths such as /Users/xxx/anaconda/bin.
        if (process.env.HOME) {
            paths.push(path.join(process.env.HOME, 'anaconda', 'bin'));
            paths.push(path.join(process.env.HOME, 'python', 'bin'));
        }
        return paths;
    }
}
exports.getKnownSearchPathsForInterpreters = getKnownSearchPathsForInterpreters;
//# sourceMappingURL=KnownPathsService.js.map