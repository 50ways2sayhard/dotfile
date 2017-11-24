'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseFormatter_1 = require("./baseFormatter");
const installer_1 = require("../common/installer");
class DummyFormatter extends baseFormatter_1.BaseFormatter {
    constructor(outputChannel) {
        super('none', installer_1.Product.yapf, outputChannel);
    }
    formatDocument(document, options, token, range) {
        return Promise.resolve([]);
    }
}
exports.DummyFormatter = DummyFormatter;
//# sourceMappingURL=dummyFormatter.js.map