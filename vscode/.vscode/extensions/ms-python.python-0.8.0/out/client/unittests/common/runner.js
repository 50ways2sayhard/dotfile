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
const utils_1 = require("./../../common/utils");
function run(file, args, cwd, token, outChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        return utils_1.execPythonFile(cwd, file, args, cwd, true, (data) => outChannel.append(data), token);
    });
}
exports.run = run;
//# sourceMappingURL=runner.js.map