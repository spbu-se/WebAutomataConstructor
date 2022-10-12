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
exports.__esModule = true;
exports.PetriNets = void 0;
var Computer_1 = require("./Computer");
var PetriNets = /** @class */ (function (_super) {
    __extends(PetriNets, _super);
    function PetriNets(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements) || this;
        _this.givesEdgeByType = function (from) {
            var result;
            result = _this.edges[0];
            _this.edges.forEach(function (edge) { return edge.transitions.forEach(function (transition) { return transition.forEach(function (way) {
                var _a;
                if (way.title === _this.alphabet.get((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value) && edge.from === from) {
                    result = edge;
                    return result;
                }
            }); }); });
            return result;
        };
        _this.haveEpsilon = function () { return _this.alphabet.get(Computer_1.EPS) !== undefined; };
        _this.toNodes = function (positions) {
            var edgesMap = [];
            positions.forEach(function (position) {
                if (_this.isTransitionActive(position.cur)) {
                    _this.edges.forEach(function (edge) {
                        var needEdge = _this.givesEdgeByType(edge.from);
                        edgesMap.push(needEdge);
                    });
                }
            });
            var toNodes = [];
            edgesMap.forEach(function (edge) { return _this.nodes.forEach(function (node) {
                if (node.id === edge.to) {
                    toNodes.push(node);
                }
            }); });
            return toNodes;
        };
        _this.nextStepPosition = function (position, by) {
            return _this.cellMatrix(position.stmt.idLogic, by).map(function (v) {
                var getLetter = function (id) {
                    var ret;
                    _this.alphabet.forEach(function (v, k) {
                        if (id === v) {
                            ret = k;
                        }
                    });
                    return ret;
                };
                var ret = {
                    stmt: v,
                    by: getLetter(by),
                    cur: _this.nodes[v.idLogic],
                    from: _this.nodes[position.stmt.idLogic]
                };
                return ret;
            });
        };
        _this.setInput = function (input) {
            _this.input = [];
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
            });
            _this.restart();
        };
        _this.nextStepPositions = function (positions, by) {
            var acc = [];
            positions.map(function (v) {
                return _this.nextStepPosition(v, by);
            }).forEach(function (ps) {
                return ps.forEach(function (p) { return acc.push(p); });
            });
            return acc;
        };
        _this.pnStep = function () {
            var curPositionMatrix = [];
            var ref = {
                counterSteps: _this.counterSteps,
                curPosition: _this.curPosition,
                historiStep: _this.historiStep
            };
            console.log("ref seems worked ".concat(ref.counterSteps, ", ").concat(ref.curPosition, ", ").concat(ref.historiStep));
            var after = _this._step(ref, []);
            _this.counterSteps = ref.counterSteps;
            _this.curPosition = ref.curPosition;
            _this.historiStep = ref.historiStep;
            _this.curPosition.forEach(function (curPos) { return curPositionMatrix.push(curPos.cur); });
            _this.changecountTokens(curPositionMatrix);
            return {
                counter: after.counter,
                history: after.history,
                isAdmit: after.isAdmit,
                nodes: after.nodes,
                byLetter: after.byLetter
            };
        };
        _this.pnRun = function () {
            var histTrace = [];
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            var curPositionMatrix = [];
            for (var i = 0; i < _this.input.length; i++) {
                var ref = {
                    counterSteps: _this.counterStepsForResult,
                    curPosition: _this.curPosition,
                    historiStep: _this.historiRun
                };
                var after = _this._step(ref, histTrace);
                _this.counterStepsForResult = ref.counterSteps;
                //console.log(this.counterStepsForResult)
                _this.curPosition = ref.curPosition;
                _this.historiRun = ref.historiStep;
                _this.curPosition.forEach(function (curPos) { return curPositionMatrix.push(curPos.cur); });
                _this.changecountTokens(curPositionMatrix);
            }
            return {
                counter: _this.counterStepsForResult,
                history: _this.historiRun,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                nodes: _this.toNodes(_this.curPosition),
                histTrace: histTrace
            };
        };
        _this._step = function (ref, histTrace) {
            var _a;
            var byLetter = [];
            var trNum = _this.alphabet.get((_a = _this.input[ref.counterSteps]) === null || _a === void 0 ? void 0 : _a.value);
            console.log("trNum ".concat(trNum));
            var nextPositions = _this.nextStepPositions(ref.curPosition, trNum);
            ref.curPosition = nextPositions;
            var nodesOfCurPos = _this.toNodes(ref.curPosition);
            nodesOfCurPos.forEach(function (node) { return console.log("nodeOfCurPos ".concat(node.id, ", ").concat(node.by)); });
            nodesOfCurPos.forEach(function (node) { return byLetter.push(node); });
            ref.historiStep.push({ nodes: nodesOfCurPos, by: trNum });
            if (ref.curPosition.length > 0) {
                ref.counterSteps++;
            }
            histTrace.push({ byLetter: byLetter });
            return {
                counter: ref.counterSteps,
                history: ref.historiStep,
                nodes: nodesOfCurPos,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                byLetter: byLetter,
                histTrace: histTrace
            };
        };
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
        _this.step = _this.pnStep;
        _this.run = _this.pnRun;
        _this.curPosition = [];
        startStatements.forEach(function (value) {
            _this.curPosition.push({
                stmt: _this.statements.get(value.id)
            });
            console.log("startStatements ".concat(value.id));
        });
        //this.nodes = graph.nodes;
        _this.setInput(input);
        _this.counterSteps = 0;
        console.log("ALPHBT");
        _this.alphabet.forEach(function (value, key) { return console.log(value, key); });
        console.log("STMTS");
        _this.statements.forEach(function (value) { return console.log(value); });
        console.log("CURPOS");
        console.log(_this.curPosition);
        console.log("MATRIX");
        _this.matrix.forEach(function (value) {
            console.log();
            value.forEach(function (value1) { return console.log(value1); });
            console.log("end of MATRIX");
        });
        return _this;
    }
    PetriNets.prototype.isTransitionActive = function (isActiveNode) {
        var _a;
        var result = false;
        var curNumberOfArcs = 0;
        var way = this.alphabet.get((_a = this.input[this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value);
        this.edges.forEach(function (edge) { return edge.transitions.forEach(function (transition) { return transition.forEach(function (tr) {
            if (tr.title === way) {
                curNumberOfArcs = tr.numberOfArcs;
            }
        }); }); });
        if (isActiveNode.countTokens >= curNumberOfArcs) {
            result = true;
            return result;
        }
        console.log("result isTransitionActive ".concat(result));
        return result;
    };
    PetriNets.prototype.changecountTokens = function (nodesForChange) {
        var _this = this;
        nodesForChange.forEach(function (nodeForChange) {
            _this.edges.forEach(function (edge) {
                if (edge.from === nodeForChange.id) {
                    _this.minusToken(nodeForChange);
                }
                if (edge.to === nodeForChange.id) {
                    _this.plusToken(nodeForChange);
                }
            });
        });
        console.log('I am in changecountTokens');
        this.nodes.forEach(function (node) { return node.isChangedTokens = false; });
    };
    PetriNets.prototype.minusToken = function (value) {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens--;
            value.isChangedTokens = true;
        }
        console.log("i was in minusToken ".concat(value.countTokens));
    };
    PetriNets.prototype.plusToken = function (value) {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens++;
            value.isChangedTokens = true;
        }
        console.log("I was in plusToken countTokens ".concat(value.countTokens));
    };
    PetriNets.prototype.haveAdmitting = function (positions) {
        return positions.reduce(function (acc, p) { return acc && p.stmt.isAdmit; }, true);
    };
    return PetriNets;
}(Computer_1.Computer));
exports.PetriNets = PetriNets;
var petri = new PetriNets({
    nodes: [
        { id: 0, isAdmit: false, countTokens: 1 },
        { id: 1, isAdmit: false, countTokens: 1 },
        { id: 2, isAdmit: false, countTokens: 0 },
    ],
    edges: [
        { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
        { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
    ]
}, [{ id: 0, isAdmit: false }, { id: 1, isAdmit: false }], ["a"]);
//console.log(`It's petri run \n ${petri.run()}`);
console.log("It's petri step \n ".concat(petri.step()));
// let petri = new PetriNets({
//         nodes: [
//             { id: 0, isAdmit: false, countTokens: 1 }, 
//             { id: 1, isAdmit: false, countTokens: 0 },
//             { id: 2, isAdmit: false, countTokens: 0 }, 
//             { id: 3, isAdmit: false, countTokens: 2 },
//             { id: 4, isAdmit: false, countTokens: 1 },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
//             { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
//             { from: 0, to: 3, transitions: new Set([[{ title: 'a', numberOfArcs: 2 }]]) }, 
//             { from: 1, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 2, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) }, 
//             { from: 3, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 3, to: 4, transitions: new Set([[{ title: 'c', numberOfArcs: 2 }]]) },
//             { from: 4, to: 2, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//             { from: 4, to: 3, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//         ]
//     },  [{ id: 0, isAdmit: false }], ["a"])
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
//             { from: 2, to: 3, transitions: new Set([[{ titlhe: '10'}]]) },
//             { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },
//         ]
//     }, [{ id: 0, isAdmit: false }], ["5"])
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
var node = { id: 1, isAdmit: false, countTokens: 3 };
petri.isTransitionActive({ id: 1, isAdmit: false, countTokens: 1 });
