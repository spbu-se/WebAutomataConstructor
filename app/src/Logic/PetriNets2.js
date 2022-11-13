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
exports.PetriNets = void 0;
var Computer_1 = require("./Computer");
var PetriNets = /** @class */ (function (_super) {
    __extends(PetriNets, _super);
    function PetriNets(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements) || this;
        _this.giveNumberArcs = function (pos) {
            var arcs = { InputArcs: 1, OutputArcs: 1 };
            _this.edges.forEach(function (edge) { return edge.transitions.forEach(function (tr) { return tr.forEach(function (way) {
                var _a, _b, _c, _d, _e, _f;
                // console.log('START');
                // console.log(`way.title ${way.title}`);
                // console.log(`this.input[this.counterSteps]?.value ${this.input[this.counterSteps]?.value}`)
                // console.log(`edge.from ${edge.from}`);
                // console.log(`edge.to ${edge.to}`)
                // console.log(`pos.stmt.id ${pos.stmt.id}`);
                // console.log(`pos.from.id ${pos.from?.id}`)
                // console.log('END');
                if ((pos.stmt.id === edge.to) && (edge.from === ((_a = pos.from) === null || _a === void 0 ? void 0 : _a.id)) && (way.title === ((_b = _this.input[_this.counterSteps]) === null || _b === void 0 ? void 0 : _b.value))) {
                    console.log('START');
                    console.log("way.title ".concat(way.title));
                    console.log("this.input[this.counterSteps]?.value ".concat((_c = _this.input[_this.counterSteps]) === null || _c === void 0 ? void 0 : _c.value));
                    console.log("edge.from ".concat(edge.from));
                    console.log("edge.to ".concat(edge.to));
                    console.log("pos.stmt.id ".concat(pos.stmt.id));
                    console.log("pos.from.id ".concat((_d = pos.from) === null || _d === void 0 ? void 0 : _d.id));
                    console.log('END');
                    console.log("number arcs in give count tokens ".concat((_e = way.countArcs) === null || _e === void 0 ? void 0 : _e.InputArcs));
                    console.log("number arcs in give count tokens ".concat((_f = way.countArcs) === null || _f === void 0 ? void 0 : _f.OutputArcs));
                    arcs = { InputArcs: way.countArcs.InputArcs, OutputArcs: way.countArcs.OutputArcs };
                }
            }); }); });
            return arcs;
        };
        _this.haveEpsilon = function () { return _this.alphabet.get(Computer_1.EPS) !== undefined; };
        // protected toNodes = (positions: position[]): NodeCore[] => {
        //     console.log('positionsd')
        //     positions.forEach(po => console.log(po))
        //     console.log('end positionsd');
        //     let edgesMap: EdgeCore[] = [];
        //     let schet: number = 0;
        //     positions.forEach(position => {
        //         this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
        //             console.log('START');
        //             console.log(way.title);
        //             console.log(this.input[this.counterSteps]?.value)
        //             console.log(edge.from);
        //             console.log(position.stmt.id);
        //             console.log('END');
        //             if ((way.title === (this.input[this.counterSteps]?.value)) && (edge.from === position.stmt.id)){
        //                 edgesMap.push(edge);
        //                 console.log('push srabotal')
        //             }
        //         })))
        //     })
        //     console.log('edgesMap')
        //     edgesMap.forEach(edgM => console.log(edgM))
        //     console.log('edgesMap');
        //     let toNodes_: NodeCore[] = [];
        //     edgesMap.forEach(edge => this.nodes.forEach(node => {
        //         if (node.id === edge.to) {
        //             toNodes_.push(node);
        //         }
        //     }))  
        //     console.log('posmotrim')
        //     toNodes_.forEach(toN => console.log(toN))
        //     console.log('end posmotrim');
        //     //toNodes_.forEach(toNode => console.log(toNode.id));
        //     let toNodes = Array.from(new Set(toNodes_))
        //     console.log('TONODES')
        //     toNodes.forEach(toNode => console.log(toNode))
        //     console.log('TONODES')
        //     return toNodes;      
        // }
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
            var after = _this._step(ref);
            _this.counterSteps = ref.counterSteps;
            _this.curPosition = ref.curPosition;
            _this.historiStep = ref.historiStep;
            return {
                counter: after.counter,
                history: after.history,
                isAdmit: after.isAdmit,
                nodes: after.nodes,
                byLetter: after.byLetter
            };
        };
        _this.pnRun = function () {
            console.log('PETRI NET RUN++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            for (var i = 0; i < _this.input.length; i++) {
                var ref = {
                    counterSteps: _this.counterStepsForResult,
                    curPosition: _this.curPosition,
                    historiStep: _this.historiRun
                };
                // console.log(`BEFORE AFTER`);
                // console.log(ref.counterSteps);
                // console.log(ref.curPosition);
                // console.log(ref.historiStep);
                var after = _this._step(ref);
                console.log("AFTER AFTER :)");
                console.log(ref.counterSteps);
                console.log(ref.curPosition);
                console.log(ref.historiStep);
                console.log("END AFTER");
                _this.counterStepsForResult = ref.counterSteps;
                _this.curPosition = ref.curPosition;
                _this.historiRun = ref.historiStep;
                // console.log('HISTORY RUN');
                // console.log(this.historiRun[0].nodes);
                // console.log('END HISTORY RUN');
            }
            return {
                counter: _this.counterStepsForResult,
                history: _this.historiRun,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                nodes: _this.toNodes(_this.curPosition)
            };
        };
        _this.getNode = function (positions) {
            var getNod = [];
            positions.forEach(function (pos) {
                getNod.push(pos.stmt);
                console.log("pos.cur");
                console.log(pos.stmt);
                console.log("end pos.cur");
            });
            return getNod;
        };
        _this._step = function (ref) {
            var _a;
            var byLetter = [];
            var trNum = _this.alphabet.get((_a = _this.input[ref.counterSteps]) === null || _a === void 0 ? void 0 : _a.value);
            ref.historiStep.push({ nodes: _this.getNode(ref.curPosition), by: trNum });
            console.log('history step');
            console.log(ref.historiStep[0].nodes);
            console.log('end history step');
            if (ref.curPosition.length > 0) {
                ref.counterSteps++;
            }
            var nextPositions = _this.nextStepPositions(ref.curPosition, trNum);
            ref.curPosition = nextPositions;
            _this.changeCountTokens(ref.curPosition);
            var nodesOfCurPos = _this.toNodes(ref.curPosition);
            nodesOfCurPos.forEach(function (node) { return byLetter.push(node); });
            // console.log('NODEOFCURPOSITION')
            // console.log(nodesOfCurPos);
            // console.log('END NODE OF CURPOSITION');
            return {
                counter: ref.counterSteps,
                history: ref.historiStep,
                nodes: nodesOfCurPos,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                byLetter: byLetter
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
            //console.log(`startStatements ${value.id}`);
        });
        //this.nodes = graph.nodes;
        _this.setInput(input);
        _this.counterSteps = 0;
        return _this;
        // console.log("ALPHBT")
        // this.alphabet.forEach((value, key) => console.log(value, key))
        // console.log("STMTS")
        // this.statements.forEach(value => console.log(value))
        // console.log("CURPOS")
        // console.log(this.curPosition)
        // console.log("MATRIX")
        // this.matrix.forEach(value => {
        //     console.log()
        //     value.forEach(value1 => console.log(value1))
        //     console.log(`end of MATRIX`);
        // })
    }
    PetriNets.prototype.isTransitionActive = function (isActive) {
        var _a, _b, _c;
        //console.log("I am in transition active");
        // let isActiveNode: NodeCore = this.startStatements[0];
        var result = false;
        // let curNumberOfArcs: CountArcs = {InputArcs: 1, OutputArcs: 1};
        // this.nodes.forEach(node => {
        //     if (node.id === isActiveId)
        //         isActiveNode = node; 
        // })
        var way = (_a = this.input[this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value;
        //console.log(`this.counterSteps ${this.counterSteps}`);
        //console.log(`way ${way}`);
        // this.edges.forEach(edge => {
        //     if (edge.from === isActiveNode.id) {
        //         edge.transitions.forEach(transition => transition.forEach(tr => {
        //             if (tr.title === way)
        //                 curNumberOfArcs = tr.countArcs!;
        //         }))
        //     }
        // })
        var numberArcs = this.giveNumberArcs(isActive);
        if ((((_b = isActive.cur) === null || _b === void 0 ? void 0 : _b.countTokens) >= numberArcs.InputArcs) && (((_c = isActive.cur) === null || _c === void 0 ? void 0 : _c.countTokens) > 0)) {
            result = true;
            //console.log(`result is ${result}`);
            // return result;
        }
        return result;
    };
    PetriNets.prototype.changeCountTokens = function (nodeForChange) {
        var _this = this;
        //console.log(`changeCountTokens`);
        //console.log(idForChange);
        //console.log(`end list pos for change`);
        var lastCurNode;
        var lastFromNode;
        nodeForChange.forEach(function (nod) {
            // if (lastCurNode !== nod.cur && nod.cur !== undefined){
            var countArcs = _this.giveNumberArcs(nod);
            console.log("number arcs in changedCountTokens ".concat(countArcs));
            _this.plusToken(nod.cur, countArcs);
            //     lastCurNode = nod.cur;
            // }
            if (lastFromNode !== nod.from && nod.from !== undefined) {
                _this.minusToken(nod.from, countArcs);
                lastFromNode = nod.from;
            }
        });
        //console.log(`after changeCountTokens`)
        //console.log(idForChange);
        //this.nodes.forEach(node => node.isChangedTokens = false)
    };
    PetriNets.prototype.minusToken = function (value, countArcs) {
        //if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
        if ((value.countTokens !== undefined) && (value.countTokens > 0)) {
            console.log("count arcs ".concat(countArcs));
            value.countTokens -= countArcs.InputArcs;
            //value.isChangedTokens = true;
        }
    };
    PetriNets.prototype.plusToken = function (value, countArcs) {
        if ((value.countTokens !== undefined)) {
            console.log("count arcs ".concat(countArcs));
            value.countTokens += countArcs.OutputArcs;
            //value.isChangedTokens = true;
        }
        //console.log(`I was in plusToken countTokens ${value.countTokens}`);
    };
    PetriNets.prototype.haveAdmitting = function (positions) {
        return positions.reduce(function (acc, p) { return acc && p.stmt.isAdmit; }, true);
    };
    PetriNets.prototype.checkTransition = function (ref) {
        var _this = this;
        this.curPosition.forEach(function (curPos) {
            if (_this.isTransitionActive(curPos) === false) {
                return _this.isTransitionActive;
            }
        });
        return true;
    };
    PetriNets.prototype.toNodes = function (positions) {
        var _this = this;
        var retNodes = [];
        positions.forEach(function (value) {
            var from = {
                id: value.from.id,
                isAdmit: value.from.isAdmit,
                countTokens: value.from.countTokens
            };
            var temp = __assign(__assign({}, _this.nodes[value.stmt.idLogic]), { from: from, cur: value.cur, by: value.by });
            retNodes.push(temp);
        });
        return retNodes;
    };
    return PetriNets;
}(Computer_1.Computer));
exports.PetriNets = PetriNets;
// let petri = new PetriNets({
//     nodes: [
//         { id: 0, isAdmit: false, countTokens: 1, isChangedTokens: false }, 
//         { id: 1, isAdmit: false, countTokens: 1, isChangedTokens: false }, 
//         { id: 2, isAdmit: false, countTokens: 0, isChangedTokens: false },
//     ],
//     edges: [
//         { from: 0, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) }, 
//         { from: 1, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) },
//     ]
// }, [{id: 0, isAdmit: false }, { id: 1, isAdmit: false }], ["a"])
// //let st = petri.step();
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// //console.log(petri.step());
var petri = new PetriNets({
    nodes: [
        { id: 0, isAdmit: false, countTokens: 1 },
        { id: 1, isAdmit: false, countTokens: 0 },
        { id: 2, isAdmit: false, countTokens: 0 },
        { id: 3, isAdmit: false, countTokens: 2 },
        { id: 4, isAdmit: false, countTokens: 1 },
    ],
    edges: [
        { from: 0, to: 1, transitions: new Set([[{ title: 'a', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 0, to: 2, transitions: new Set([[{ title: 'a', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 0, to: 3, transitions: new Set([[{ title: 'a', countArcs: { InputArcs: 1, OutputArcs: 2 } }]]) },
        { from: 1, to: 1, transitions: new Set([[{ title: 'b', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 2, to: 1, transitions: new Set([[{ title: 'b', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 3, to: 1, transitions: new Set([[{ title: 'b', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 3, to: 4, transitions: new Set([[{ title: 'c', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 4, to: 2, transitions: new Set([[{ title: 'd', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
        { from: 4, to: 3, transitions: new Set([[{ title: 'd', countArcs: { InputArcs: 1, OutputArcs: 1 } }]]) },
    ]
}, [{ id: 0, isAdmit: false }], ["a"]);
//console.log(`It's petri run \n ${petri.run()}`)
//console.log(`It's petri step \n ${petri.step()}`)
console.log(petri.step());
//console.log(petri.step());
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
