"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HistoryItem {
    constructor(documentKey, bookmarkKey) {
        this.documentKey = documentKey;
        this.bookmarkKey = bookmarkKey;
    }
}
exports.HistoryItem = HistoryItem;
class History {
    constructor() {
        this.history = new Array();
        this.add = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i !== -1) {
                this.index = i;
                return;
            }
            const item = new HistoryItem(docKey, bkKey);
            const len = this.history.length;
            if (len === 0) {
                this.index = 0;
                this.history.push(item);
                return item;
            }
            this.history.splice(++this.index, 0, item);
            return item;
        };
        this.remove = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i === -1)
                return null;
            const len = this.history.length;
            if (len !== 1 && this.index >= i && this.index === len - 1) {
                this.index = 0;
            }
            const rm = this.history.splice(i, 1);
            if (this.history.length === 0)
                this.index = -1;
            return rm[0];
        };
        this.removeDoc = (docKey) => {
            this.history = this.history.filter((hi) => hi.documentKey !== docKey);
            this.index = Math.min(this.index, this.history.length);
        };
        this.clear = () => {
            this.history.length = 0;
            this.index = -1;
        };
        this.goto = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i === -1) {
                return false;
            }
            this.index = i;
        };
        this.replace = (docKey, bkKey, toDocKey, toBkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i !== -1) {
                this.history[i].bookmarkKey = toDocKey;
                this.history[i].documentKey = toDocKey;
            }
        };
        this.next = () => {
            const len = this.history.length;
            if (len === 0)
                return null;
            if (this.index + 1 === len) {
                this.index = 0;
                return this.history[0];
            }
            return this.history[++this.index];
        };
        this.previous = () => {
            const len = this.history.length;
            if (len === 0)
                return null;
            if (this.index === 0) {
                this.index = len - 1;
                return this.history[this.index];
            }
            return this.history[--this.index];
        };
    }
    modify(docKey, bkKey, bkKeyNew) {
        let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
        if (i === -1)
            return;
        let j = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKeyNew);
        if (j !== -1) {
            this.remove(docKey, bkKeyNew);
        }
        this.history[i].bookmarkKey = bkKeyNew;
    }
}
exports.History = History;
//# sourceMappingURL=history.js.map