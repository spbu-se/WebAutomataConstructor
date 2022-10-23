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
        // protected givesEdgeByType = (from: number, schet: number): EdgeCore => {
        //     let check: number = 0;
        //     let result: EdgeCore;
        //     result = this.edges[0];
        //     this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
        //         //console.log(`way.title ${way.title} and input ${this.input[this.counterSteps]?.value} and edge.from ${edge.from} and from ${from}`);
        //         console.log(`check ${check}`);
        //         console.log(`schet ${schet}`);
        //         if (way.title === (this.input[this.counterSteps]?.value) &&  (edge.from === from)) {
        //             check++;
        //             if ( check === schet )
        //             result = edge;
        //             //console.log(edge);
        //             return result;
        //         }
        //     }))) 
        //     return result;
        // }
        _this.haveEpsilon = function () { return _this.alphabet.get(Computer_1.EPS) !== undefined; };
        _this.toNodes = function (positions) {
            var edgesMap = [];
            var schet = 0;
            positions.forEach(function (position) {
                //console.log(`position.cur! ${position.cur!.id}`);
                //if (this.isTransitionActive(position.cur!)) {
                _this.edges.forEach(function (edge) { return edge.transitions.forEach(function (transition) { return transition.forEach(function (way) {
                    var _a;
                    if ((way.title === ((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value)) && (edge.from === position.stmt.id)) {
                        edgesMap.push(edge);
                        console.log("edge from ".concat(edge.from, " and edge to ").concat(edge.to));
                    }
                }); }); });
            });
            var toNodes_ = [];
            edgesMap.forEach(function (edge) { return _this.nodes.forEach(function (node) {
                if (node.id === edge.to) {
                    toNodes_.push(node);
                }
            }); });
            //toNodes_.forEach(toNode => console.log(toNode.id));
            var toNodes = Array.from(new Set(toNodes_));
            toNodes.forEach(function (toNode) { return console.log("toNode ".concat(toNode.id)); });
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
                //console.log(ret);
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
            var ref = {
                counterSteps: _this.counterSteps,
                curPosition: _this.curPosition,
                historiStep: _this.historiStep
            };
            var after = _this._step(ref, []);
            _this.counterSteps = ref.counterSteps;
            _this.curPosition = ref.curPosition;
            _this.historiStep = ref.historiStep;
            //this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
            console.log("this curPosition");
            console.log(_this.curPosition);
            //this.changeCountTokens(this.curPosition);
            //console.log(`counter ${after.counter}, history ${after.history.length}, isAdmit ${after.isAdmit}, nodes ${after.nodes[0].id}, byLetter ${after.byLetter}`);
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
            console.log("-------------------------------------------------------------------");
            for (var i = 0; i < _this.input.length; i++) {
                var ref = {
                    counterSteps: _this.counterStepsForResult,
                    curPosition: _this.curPosition,
                    historiStep: _this.historiRun
                };
                _this.curPosition.forEach(function (curPos) { return console.log("curPos in Run ".concat(curPos.stmt.id)); });
                console.log("ref.counterSteps ".concat(ref.counterSteps, " and ref.historiRun ").concat(_this.historiRun));
                var after = _this._step(ref, histTrace);
                _this.counterStepsForResult = ref.counterSteps;
                //ref.curPosition = this.nextStepPositions(this.curPosition, this.alphabet.get(this.input[this.counterSteps]?.value));
                //console.log(this.counterStepsForResult)
                _this.curPosition = ref.curPosition;
                _this.historiRun = ref.historiStep;
                //this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
                //this.changeCountTokens(this.curPosition);
            }
            console.log("petri return");
            _this.historiRun.forEach(function (hist) { return console.log("historyRun ".concat(hist.by)); });
            console.log("this.counterStepsForResult === ".concat(_this.counterStepsForResult, " and this.historiRun ").concat(_this.historiRun, " and this.haveAdmitting(this.curPosition)\n        ").concat(_this.haveAdmitting(_this.curPosition), " and this.toNodes(this.curPosition) ").concat(_this.toNodes(_this.curPosition)));
            //this.curPosition = this.nextStepPositions(this.curPosition, this.alphabet.get(this.input[this.counterSteps]?.value))
            console.log("this curPosition after changes");
            _this.curPosition.forEach(function (curPos) {
                console.log("begin curPos");
                console.log(curPos);
            });
            //this.curPosition.forEach(curPos => console.log(`this.curPosition in pnRun ${curPos.cur!.id}`));
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
            console.log("STEP BEGIN");
            var byLetter = [];
            var trNum = _this.alphabet.get((_a = _this.input[ref.counterSteps]) === null || _a === void 0 ? void 0 : _a.value);
            console.log("TRACE NUMBER ".concat(trNum));
            //this.changeCountTokens(this.curPosition);
            // if (this.checkTransition(ref)) {
            //     console.log(`nu if srabotal v stepe poluchaetsa`)
            //     ref.counterSteps++;
            //     return {
            //         counter: ref.counterSteps,
            //         history: ref.historiStep, 
            //         nodes: this.toNodes(this.curPosition),
            //         isAdmit: this.haveAdmitting(this.curPosition),
            //         byLetter, 
            //         histTrace
            //     }
            // }
            var nextPositions = _this.nextStepPositions(ref.curPosition, trNum);
            //let nowPositions: position[] = [];
            //nextPositions.forEach(next => nowPositions.push(next.));
            var numChange = [];
            nextPositions.forEach(function (next) { var _a; return numChange.push((_a = next.from) === null || _a === void 0 ? void 0 : _a.id); });
            _this.changeCountTokens(numChange);
            ref.curPosition = nextPositions;
            console.log("NEXTSTEPPOSITIONS");
            ref.curPosition.forEach(function (cr) { return console.log(cr); });
            console.log("END OF NEXTSTEPPOSITIONS");
            var nodesOfCurPos = _this.toNodes(ref.curPosition);
            //nodesOfCurPos.forEach(node => console.log(`nodeOfCurPos ${node.id}, ${node.by}`))
            nodesOfCurPos.forEach(function (node) { return byLetter.push(node); });
            console.log("");
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
            //console.log(`this statements get value id ${this.statements.get(value.id)}`)
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
    PetriNets.prototype.isTransitionActive = function (isActiveId) {
        var _a;
        //console.log("I am in transition active");
        var isActiveNode = this.startStatements[0];
        var result = false;
        var curNumberOfArcs = 0;
        this.nodes.forEach(function (node) {
            if (node.id === isActiveId)
                isActiveNode = node;
        });
        var way = (_a = this.input[this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value;
        //console.log(`this.counterSteps ${this.counterSteps}`);
        //console.log(`way ${way}`);
        this.edges.forEach(function (edge) {
            if (edge.from === isActiveNode.id) {
                edge.transitions.forEach(function (transition) { return transition.forEach(function (tr) {
                    if (tr.title === way)
                        curNumberOfArcs = tr.numberOfArcs;
                }); });
            }
        });
        // this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(tr => {
        //     console.log(`tr title = ${tr.title}, edge.from == ${edge.from}, edge.to == ${edge.from}, isActiveNode from id == ${isActiveNode.from?.id}
        //     , isActiveNode id === ${isActiveNode.id}`);
        //     if ((tr.title === way) && (isActiveNode.from?.id === edge.from) && (isActiveNode.id === edge.to)) {
        //         curNumberOfArcs = tr.numberOfArcs!;
        //         console.log(`tr.title ${tr.title} and way ${way}`);
        // }})))
        //console.log(`Node id ${isActiveNode.id} and node.countTokens ${isActiveNode.countTokens!} and curNumberArcs ${curNumberOfArcs}`)
        if ((isActiveNode.countTokens >= curNumberOfArcs) && (isActiveNode.countTokens > 0)) {
            result = true;
            console.log("result is ".concat(result));
            return result;
        }
        //console.log(`result isTransitionActive ${result}`);
        //console.log("-----------------------------------------------------------------------------------------------");
        return result;
    };
    PetriNets.prototype.changeCountTokens = function (idForChange) {
        var _this = this;
        var nodesForChange = [];
        idForChange.forEach(function (id) { return _this.nodes.forEach(function (node) {
            if (id === node.id) {
                nodesForChange.push(node);
                //console.log(`nodesForChange`);
                //console.log(node);
            }
        }); });
        var plus = [];
        this.toNodes(this.curPosition).forEach(function (toNode) { return plus.push(toNode); });
        plus.forEach(function (pl) { return _this.plusToken(pl); });
        console.log("nodesForChange");
        nodesForChange.forEach(function (node) { return console.log(node); });
        nodesForChange.forEach(function (nodeForChange) {
            //this.edges.forEach(edge => {
            //if (edge.from === nodeForChange.id) {
            _this.minusToken(nodeForChange);
            //edgePlusToken.push(edge);
            //}
            // if (edge.to === nodeForChange.id) {
            //     this.plusToken(nodeForChange)
            // }
        });
        console.log('I am in changeCountTokens');
        console.log(nodesForChange);
        this.nodes.forEach(function (node) { return node.isChangedTokens = false; });
    };
    PetriNets.prototype.minusToken = function (value) {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens--;
            value.isChangedTokens = true;
        }
        //console.log(`i was in minusToken ${value.countTokens}`);
    };
    PetriNets.prototype.plusToken = function (value) {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens++;
            value.isChangedTokens = true;
        }
        //console.log(`I was in plusToken countTokens ${value.countTokens}`);
    };
    PetriNets.prototype.haveAdmitting = function (positions) {
        return positions.reduce(function (acc, p) { return acc && p.stmt.isAdmit; }, true);
    };
    PetriNets.prototype.checkTransition = function (ref) {
        var _this = this;
        this.curPosition.forEach(function (curPos) {
            var _a;
            console.log("this curPOsition ".concat((_a = curPos.cur) === null || _a === void 0 ? void 0 : _a.id));
            //this.isTransitionActive(curPos.stmt.id);
            if (_this.isTransitionActive(curPos.stmt.id) === false) {
                console.log("srabotal perehod v stepe");
                return _this.isTransitionActive;
            }
        });
        return true;
    };
    return PetriNets;
}(Computer_1.Computer));
exports.PetriNets = PetriNets;
var petri = new PetriNets({
    nodes: [
        { id: 0, isAdmit: false, countTokens: 0, isChangedTokens: false },
        { id: 1, isAdmit: false, countTokens: 1, isChangedTokens: false },
        { id: 2, isAdmit: false, countTokens: 0, isChangedTokens: false },
    ],
    edges: [
        { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
        { from: 1, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
    ]
}, [{ id: 0, isAdmit: false }, { id: 1, isAdmit: false }], ["a"]);
//let st = petri.step();
//console.log(`It's petri run \n ${petri.run()}`)
//console.log(`It's petri step \n ${petri.step()}`)
console.log(petri.run());
//console.log(petri.step());
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
//             { from: 0, to: 3, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
//             { from: 1, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 2, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) }, 
//             { from: 3, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 3, to: 4, transitions: new Set([[{ title: 'c', numberOfArcs: 1 }]]) },
//             { from: 4, to: 2, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//             { from: 4, to: 3, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//         ]
//     },  [{ id: 0, isAdmit: false }], ["a", "c"])
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// //console.log(petri.step());
// let petri = new PetriNets({
//     nodes: [
//         { id: 0, isAdmit: false, countTokens: 1 }, 
//         { id: 1, from: {id: 0, isAdmit: false, countTokens: 1 }, isAdmit: false, countTokens: 0 }, 
//     ],
//     edges: [
//         { from: 0, to: 1, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) }, 
//         ]
// }, [{id: 0, isAdmit: false }], ["a"])
// console.log(`It's petri run \n ${petri.run()}`);
//console.log(`It's petri step \n ${petri.step()}`);
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
// {
//     nodes: [
//         { id: 0, isAdmit: false, output: '0' },
//         { id: 1, isAdmit: false, output: '1' },
//         { id: 2, isAdmit: false, output: '2' },
//         { id: 3, isAdmit: false, output: '3' },
//     ],
//     edges: [
//         { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
//         { from: 1, to: 2, transitions: new Set([[{ title: '10'}]]) },
//         { from: 2, to: 3, transitions: new Set([[{ titlhe: '10'}]]) },
//         { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },
//     ]
// }, [{ id: 0, isAdmit: false }], ["5"])
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
// // let node: NodeCore = { id: 1, isAdmit: false, countTokens: 1 };
// // petri.isTransitionActive(node);
