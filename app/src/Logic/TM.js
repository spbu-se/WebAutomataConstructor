"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.TM = exports.TMMemory = void 0;
var IGraphTypes_1 = require("./IGraphTypes");
var PDA_1 = require("./PDA");
var TMMemory = /** @class */ (function () {
    function TMMemory() {
        this.storage = ['_'];
        this.pointer = 0;
    }
    TMMemory.prototype.getPointer = function () {
        return this.pointer;
    };
    TMMemory.prototype.reset = function () {
        this.storage = ['_'];
        this.pointer = 0;
    };
    TMMemory.prototype.lookUp = function () {
        return this.storage[this.pointer];
    };
    TMMemory.prototype.initialize = function (init) {
        var _this = this;
        init.forEach(function (value) { return _this.mvRight('_', value); });
        this.pointer = 0;
    };
    TMMemory.prototype.mvRight = function (curr, upd) {
        if (this.storage[this.pointer] === curr) {
            this.storage[this.pointer] = upd;
            this.pointer++;
        }
        if (this.pointer === this.storage.length) {
            this.storage.push('_');
        }
    };
    TMMemory.prototype.mvLeft = function (curr, upd) {
        if (this.pointer === 0) {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd;
                this.pointer = 0;
            }
            var tmp_1 = ['_'];
            this.storage.forEach(function (value) { return tmp_1.push(value); });
            this.storage = tmp_1;
        }
        else {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd;
                this.pointer--;
            }
        }
    };
    TMMemory.prototype.getStorage = function () {
        return this.storage;
    };
    return TMMemory;
}());
exports.TMMemory = TMMemory;
var TM = /** @class */ (function (_super) {
    __extends(TM, _super);
    function TM(graph, startStatement, input) {
        var _this = _super.call(this, graph, startStatement, input) || this;
        _this.mem = new TMMemory();
        _this.__step = function (counter, tr, histori) {
            var by = "";
            _this.cellMatrix(_this.curPosition[0].stmt.idLogic, tr).forEach(function (value) {
                if (value.stackDown === _this.mem.lookUp()) {
                    if (value.move === IGraphTypes_1.Move.R) {
                        _this.mem.mvRight(value.stackDown, value.stackPush[0]);
                        by = value.stackDown;
                    }
                    if (value.move === IGraphTypes_1.Move.L) {
                        _this.mem.mvLeft(value.stackDown, value.stackPush[0]);
                        by = value.stackDown;
                    }
                    _this.assignCurMt({ stmt: _this.statements.get(value.id) });
                }
            });
            histori.push({
                nodes: [_this.nodes[_this.curPosition[0].stmt.idLogic]],
                by: by
                // this.input[counter].value
            });
            console.log("this.mem.getStorage()");
            console.log(_this.mem.getStorage());
            counter++;
            return {
                nodes: [_this.nodes[_this.curPosition[0].stmt.idLogic]],
                isAdmit: _this.curPosition[0].stmt.isAdmit,
                counter: counter,
                history: histori,
                memory: _this.mem.getStorage(),
                pointer: _this.mem.getPointer()
            };
        };
        _this.restart = function () {
            _this.counterSteps = 0;
            _this.historiStep = [];
            _this.curPosition = [];
            _this.mem.reset();
            _this.curPosition = [{
                    stmt: _this.statements.get(_this.startStatements[0].id)
                }];
        };
        _this.run = function () {
            throw Error("TM run");
        };
        _this.setInput = function (input) {
            _this.input = [];
            // this.restart()
            _this.mem.reset();
            _this.mem.initialize(input);
            _this.counterSteps = 0;
            _this.historiStep = [];
            _this.curPosition = [];
            _this.curPosition = [{
                    stmt: _this.statements.get(_this.startStatements[0].id)
                }];
            console.log(_this.curPosition);
        };
        _this.step = function () {
            console.log("STPMT");
            var ret = _this.__step(_this.counterSteps, 0, _this.historiStep);
            _this.counterSteps = ret.counter;
            _this.historiStep = ret.history;
            if (ret.history[ret.history.length - 1].by === "") {
                ret.nodes = [];
            }
            return __assign(__assign({}, ret), { memory: _this.mem.getStorage() });
        };
        _this.checkMemFormat(graph);
        // if (!this.isDeterministic()) {
        //     throw Error ("Not deterministic")
        // }
        _this.mem.initialize(input);
        _this.curPosition = [{
                stmt: _this.statements.get(_this.startStatements[0].id)
            }];
        console.log("MTMTMTMTMTTMMTMTMT::::::::::");
        return _this;
    }
    TM.prototype.checkMemFormat = function (graph) {
        var isMtMem = true;
        graph.edges.forEach(function (value) { return value.transitions.forEach(function (value1) {
            value1.forEach(function (value2) {
                var _a, _b;
                if (((_a = value2.stackPush) === null || _a === void 0 ? void 0 : _a.length) && ((_b = value2.stackPush) === null || _b === void 0 ? void 0 : _b.length) > 1) {
                    isMtMem = false;
                }
            });
        }); });
        if (!isMtMem) {
            throw Error("Not MT mem");
        }
    };
    TM.prototype.curMt = function () {
        return this.curPosition[0];
    };
    TM.prototype.assignCurMt = function (newPos) {
        this.curPosition[0] = newPos;
    };
    return TM;
}(PDA_1.PDA));
exports.TM = TM;
// let nfa = new TM(
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//             {id: 3, isAdmit: false},
//             {id: 4, isAdmit: false},
//
//         ],
//         edges: [
//             { from: 1, to: 1, transitions: new Set([[{title: EPS, stackDown: '0', stackPush: ['0'], move: Move.R}, {title: EPS, stackDown: '1', stackPush: ['1'], move: Move.R} ]]) },
//             { from: 1, to: 2, transitions: new Set([[{title: EPS, stackDown: '_', stackPush: ['_'], move: Move.L} ]]) },
//             { from: 2, to: 2, transitions: new Set([[{title: EPS, stackDown: '1', stackPush: ['0'], move: Move.L} ]]) },
//             { from: 2, to: 3, transitions: new Set([[{title: EPS, stackDown: '0', stackPush: ['1'], move: Move.L} ]]) },
//             { from: 2, to: 4, transitions: new Set([[{title: EPS, stackDown: '_', stackPush: ['1'], move: Move.L} ]]) },
//
//             // { from: 1, to: 2, transitions: new Set([[ {title: EPS, stackDown: '_', stackPush: ['V'], move: Move.R} ]]) },
//             // { from: 2, to: 2, transitions: new Set([[ {title: EPS, stackDown: '_', stackPush: ['B'], move: Move.R} ]]) },
//             // { from: 2, to: 1, transitions: new Set([[ { title: 'b', stackDown: 'b', stackPush: ['6'], move: Move.R } ]]) },
//             // { from: 3, to: 3, transitions: new Set([[ { title: 'c', stackDown: 'с', stackPush: ['['], move: Move.R } ]]) },
//             // { from: 3, to: 3, transitions: new Set([[ { title: 'c', stackDown: '_', stackPush: [']'], move: Move.R } ]]) },
//
//             // {from: 1, to: 1, transitions: new Set([{title: 'a', stackDown: 'a', stackPush: ['A'], move: Move.R}])},
//             // {from: 1, to: 2, transitions: new Set([{title: 'c', stackDown: 'b', stackPush: ['V'], move: Move.R}])},
//             // {from: 2, to: 2, transitions: new Set([{title: 'c', stackDown: '_', stackPush: ['V'], move: Move.R}])},
//
//
//
//         ]
//     },  [{id: 1, isAdmit: false}], ['1'])
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// nfa.setInput(['1'])
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
