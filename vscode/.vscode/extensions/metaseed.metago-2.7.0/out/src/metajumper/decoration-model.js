"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CharIndex {
    constructor(charIndex, inteliAdj = InteliAdjustment.Default) {
        this.charIndex = charIndex;
        this.inteliAdj = inteliAdj;
    }
}
exports.CharIndex = CharIndex;
var InteliAdjustment;
(function (InteliAdjustment) {
    InteliAdjustment[InteliAdjustment["Before"] = -1] = "Before";
    InteliAdjustment[InteliAdjustment["Default"] = 0] = "Default"; // default is after
})(InteliAdjustment = exports.InteliAdjustment || (exports.InteliAdjustment = {}));
var Direction;
(function (Direction) {
    Direction[Direction["up"] = -1] = "up";
    Direction[Direction["down"] = 1] = "down";
})(Direction = exports.Direction || (exports.Direction = {}));
class DecorationModel {
    constructor() {
        this.children = [];
    }
}
exports.DecorationModel = DecorationModel;
class LineCharIndex {
    constructor(line = -1, char = -1, indexInModels = -1, inteliAdj = InteliAdjustment.Default) {
        this.line = line;
        this.char = char;
        this.indexInModels = indexInModels;
        this.inteliAdj = inteliAdj;
    }
}
LineCharIndex.END = new LineCharIndex();
class LineCharIndexState {
    constructor(lineIndexes, direction = Direction.up, up, down) {
        this.lineIndexes = lineIndexes;
        this.direction = direction;
        this.up = up;
        this.down = down;
        this.upIndexCounter = 0;
        this.downIndexCounter = 1;
    }
    findNextAutoWrap() {
        let lineCharIndex = this.findNext();
        if (lineCharIndex.lineCharIndex === LineCharIndex.END) {
            this.toggleDirection();
            lineCharIndex = this.findNext();
        }
        return lineCharIndex;
    }
    toggleDirection() {
        this.direction = this.direction === Direction.up ? Direction.down : Direction.up;
    }
    findNext() {
        if (this.direction === Direction.up) {
            return this.findUp();
        }
        else {
            return this.findDown();
        }
    }
    findUp() {
        let lineCharIndex = this.up;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];
        if (!charIndexes)
            return { lineCharIndex: LineCharIndex.END, lineChanged: false }; //to end;
        if (lineCharIndex.char >= 0) {
            let r = new LineCharIndex(line, charIndexes[lineCharIndex.char].charIndex, this.upIndexCounter--, charIndexes[lineCharIndex.char].inteliAdj);
            lineCharIndex.char--;
            return { lineCharIndex: r, lineChanged: false };
        }
        else {
            lineCharIndex.line -= 1;
            charIndexes = this.lineIndexes.indexes[lineCharIndex.line];
            if (!charIndexes)
                return { lineCharIndex: LineCharIndex.END, lineChanged: false }; //to end;
            lineCharIndex.char = charIndexes.length - 1;
            return { lineCharIndex: this.findNext().lineCharIndex, lineChanged: true };
        }
    }
    findDown() {
        let lineCharIndex = this.down;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];
        if (!charIndexes)
            return { lineCharIndex: LineCharIndex.END, lineChanged: false }; //to end;
        if (lineCharIndex.char < charIndexes.length) {
            let r = new LineCharIndex(line, charIndexes[lineCharIndex.char].charIndex, this.downIndexCounter++, charIndexes[lineCharIndex.char].inteliAdj);
            lineCharIndex.char++;
            return { lineCharIndex: r, lineChanged: false };
        }
        else {
            lineCharIndex.line += 1;
            lineCharIndex.char = 0;
            return { lineCharIndex: this.findNext().lineCharIndex, lineChanged: true };
        }
    }
}
class DecorationModelBuilder {
    constructor() {
        this.initialize = (config) => {
            this.config = config;
        };
        this.buildDecorationModel = (lineIndexes) => {
            let models = [];
            let line = lineIndexes.focusLine;
            let lineIndexesState = new LineCharIndexState(lineIndexes, Direction.up, new LineCharIndex(line, lineIndexes.indexes[line].length - 1), new LineCharIndex(line + 1, 0));
            let twoCharsMax = Math.pow(this.config.jumper.characters.length, 2);
            let leadChars = lineIndexes.count > twoCharsMax ? twoCharsMax : lineIndexes.count;
            leadChars = Math.trunc(leadChars / this.config.jumper.characters.length); // just process two letter codes
            // one char codes
            for (let i = leadChars; i < this.config.jumper.characters.length; i++) {
                let lci = lineIndexesState.findNextAutoWrap();
                let lineCharIndex = lci.lineCharIndex;
                if (lineCharIndex === LineCharIndex.END)
                    return models;
                let model = new DecorationModel();
                model.code = this.config.jumper.characters[i];
                model.index = i;
                model.line = lineCharIndex.line;
                model.character = lineCharIndex.char;
                model.indexInModels = lineCharIndex.indexInModels;
                model.inteliAdj = lineCharIndex.inteliAdj;
                models.push(model);
                if (lci.lineChanged)
                    lineIndexesState.toggleDirection();
            }
            // two char codes
            for (let i = 0; i < leadChars; i++) {
                lineIndexesState.toggleDirection();
                let root;
                for (let k = 0; k < this.config.jumper.characters.length; k++) {
                    let lineCharIndex = lineIndexesState.findNextAutoWrap().lineCharIndex;
                    if (lineCharIndex === LineCharIndex.END)
                        return models;
                    let model = new DecorationModel();
                    if (k === 0) {
                        root = model;
                    }
                    model.code = this.config.jumper.characters[i] + this.config.jumper.characters[k];
                    model.index = i;
                    model.line = lineCharIndex.line;
                    model.character = lineCharIndex.char;
                    model.inteliAdj = lineCharIndex.inteliAdj;
                    model.indexInModels = lineCharIndex.indexInModels;
                    models.push(model);
                    let childModel = Object.assign({}, model);
                    childModel.root = root;
                    childModel.children = [];
                    childModel.code = this.config.jumper.characters[k];
                    root.children.push(childModel);
                }
            }
            return models;
        };
    }
}
exports.DecorationModelBuilder = DecorationModelBuilder;
//# sourceMappingURL=decoration-model.js.map