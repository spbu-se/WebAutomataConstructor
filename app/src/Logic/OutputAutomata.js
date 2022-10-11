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
exports.OutputAutomata = void 0;
var Computer_1 = require("./Computer");
var OutputAutomata = /** @class */ (function (_super) {
    __extends(OutputAutomata, _super);
    function OutputAutomata(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements) || this;
        // isDeterministic(): boolean {
        //     const ret = this.matrix.reduce((acc: boolean, line) =>
        //         acc && line.reduce((_: boolean, cell) =>
        //             cell.reduce((accCell: boolean, stmt, index) => {
        //                 if (index !== 0) {
        //                     if (stmt.stackDown !== undefined) {
        //                         return accCell && !(stmt.stackDown === cell[0].stackDown)
        //                     }
        //                     if (stmt.stackDown === undefined) {
        //                         return accCell && false
        //                     }
        //                 }
        //                 return accCell
        //             }
        //                 , acc),
        //             acc),
        //         true)
        //     return ret 
        // }
        _this.restart = function () {
            _this.counterSteps = 0;
            _this.historiStep = [];
            _this.curPosition = [];
            _this.startStatements.forEach(function (value) {
                _this.curPosition.push({
                    stmt: _this.statements.get(value.id)
                });
            });
        };
        _this.oaRun = function () {
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            var output;
            for (var i = 0; i < _this.input.length; i++) {
                var ref = {
                    counterSteps: _this.counterStepsForResult,
                    curPosition: _this.curPosition,
                    historiStep: _this.historiRun
                };
                var after = _this._step(ref);
                _this.counterStepsForResult = ref.counterSteps;
                _this.curPosition = ref.curPosition;
                _this.historiRun = ref.historiStep;
                output = after.output;
            }
            return {
                counter: _this.counterStepsForResult,
                history: _this.historiRun,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                nodes: _this.toNodes(_this.curPosition),
                output: output
            };
        };
        _this.haveEpsilon = function () { return _this.alphabet.get(Computer_1.EPS) !== undefined; };
        _this.nextStepPosition = function (position, by) {
            return _this.cellMatrix(position.stmt.idLogic, by).map(function (v) { return ({ position: { stmt: v }, output: v.output }); });
        };
        _this.nextStepPositions = function (positions, by) {
            var nextPOs = positions.map(function (v) { return _this.nextStepPosition(v, by); });
            var nextPs = nextPOs.reduce(function (acc, pos) {
                pos.forEach(function (po) { return acc.push(po.position); });
                return acc;
            }, []);
            var nextOs = nextPOs.reduce(function (acc, pos) {
                pos.forEach(function (po) {
                    if (po.output === undefined) {
                        throw new Error("Output undefinded");
                    }
                    acc.push(po.output);
                });
                return acc;
            }, []);
            return { positions: nextPs, outputs: nextOs };
        };
        _this._step = function (ref) {
            var _a;
            var trNum = _this.alphabet.get((_a = _this.input[ref.counterSteps]) === null || _a === void 0 ? void 0 : _a.value);
            var nextPositions = _this.nextStepPositions(ref.curPosition, trNum);
            ref.curPosition = nextPositions.positions;
            var nodesOfCurPos = _this.toNodes(ref.curPosition);
            ref.historiStep.push({ nodes: nodesOfCurPos, by: trNum });
            if (ref.curPosition.length > 0) {
                ref.counterSteps++;
            }
            return {
                counter: ref.counterSteps,
                history: ref.historiStep,
                isAdmit: _this.haveAdmitting(ref.curPosition),
                nodes: nodesOfCurPos,
                output: nextPositions.outputs
            };
        };
        _this.oaStep = function () {
            var ref = {
                counterSteps: _this.counterSteps,
                curPosition: _this.curPosition,
                historiStep: _this.historiStep
            };
            var after = _this._step(ref);
            _this.counterSteps = ref.counterSteps;
            _this.curPosition = ref.curPosition;
            _this.historiStep = ref.historiStep;
            return {
                counter: after.counter,
                history: after.history,
                isAdmit: after.isAdmit,
                nodes: after.nodes,
                output: after.output
            };
        };
        _this.setInput = function (input) {
            _this.input = [];
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
            });
            _this.restart();
        };
        _this.curPosition = [];
        startStatements.forEach(function (value) {
            _this.curPosition.push({
                stmt: _this.statements.get(value.id)
            });
        });
        _this.setInput(input);
        _this.counterSteps = 0;
        console.log("ALPHBT");
        _this.alphabet.forEach(function (value, key) { return console.log(value, key); });
        console.log("STMTS");
        _this.statements.forEach(function (value) { return console.log(value); });
        console.log(_this.curPosition);
        _this.matrix.forEach(function (value) {
            console.log();
            value.forEach(function (value1) { return console.log(value1); });
        });
        return _this;
    }
    OutputAutomata.prototype.isDeterministic = function () {
        var ret = true;
        this.matrix.forEach(function (line) { return line.forEach(function (cells) {
            var fstCell = cells[0];
            var hasDublicates = cells.reduce(function (acc, stmt) { return acc || (stmt.stackDown === fstCell.stackDown); }, false);
            if (cells.length > 1 && hasDublicates) {
                ret = false;
            }
        }); });
        return ret;
    };
    OutputAutomata.prototype.toNodes = function (positions) {
        var _this = this;
        var retNodes = [];
        positions.forEach(function (value) {
            var temp = __assign(__assign({}, _this.nodes[value.stmt.idLogic]), { stack: value.stack === undefined ? undefined : value.stack.getStorage() });
            retNodes.push(temp);
        });
        return retNodes;
    };
    OutputAutomata.prototype.haveAdmitting = function (positions) {
        return positions.reduce(function (acc, p) { return acc && p.stmt.isAdmit; }, true);
    };
    return OutputAutomata;
}(Computer_1.Computer));
exports.OutputAutomata = OutputAutomata;
// let nfa = new Moor(
//     {
//         nodes: [
//             { id: 0, isAdmit: false, output: '0' },
//             { id: 1, isAdmit: false, output: '1' },
//             { id: 2, isAdmit: false, output: '2' },
//             { id: 3, isAdmit: false, output: '3' },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: '10'}]]) },
//             { from: 2, to: 3, transitions: new Set([[{ title: '10'}]]) },
//             { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },
//         ]
//     }, [{ id: 0, isAdmit: false }], ["5"])
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
