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
exports.Mealy = void 0;
var OutputAutomata_1 = require("./OutputAutomata");
var Mealy = /** @class */ (function (_super) {
    __extends(Mealy, _super);
    function Mealy(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements, input) || this;
        _this.mealyToMoore = function () {
            var outs = new Map();
            _this.edges.forEach(function (edge) {
                edge.transitions.forEach(function (_) { return _.forEach(function (transition) {
                    var out = transition.output;
                    if (!outs.has(out)) {
                        outs.set(out, outs.size);
                    }
                }); });
            });
            var nodesOuts = function () {
                var counter = 0;
                return _this.nodes.reduce(function (acc, node) {
                    var edges = _this.edges.filter(function (edge) { return edge.to === node.id; });
                    var tmp = [];
                    outs.forEach(function () { return tmp.push(undefined); });
                    edges.forEach(function (edge) {
                        edge.transitions.forEach(function (_) { return _.forEach(function (transition) {
                            var out = transition.output;
                            var outIndex = outs.get(out);
                            if (!tmp[outIndex]) {
                                tmp[outIndex] = {
                                    id: counter,
                                    isAdmit: node.isAdmit,
                                    output: out
                                };
                                counter++;
                            }
                        }); });
                    });
                    if (tmp.filter(function (v) { return v !== undefined; }).length === 0) {
                        tmp[0] = {
                            id: counter,
                            isAdmit: node.isAdmit,
                            output: "~"
                        };
                        counter++;
                    }
                    acc.push(tmp);
                    return acc;
                }, []);
            };
            var _nodesOuts = nodesOuts();
            var _edges = _nodesOuts.reduce(function (acc, vs, index) {
                var edges = _this.edges.filter(function (edge) { return edge.from === _this.nodes[index].id; });
                edges.forEach(function (edge) { return edge.transitions.forEach(function (_) { return _.forEach(function (transition) {
                    vs.forEach(function (v) {
                        console.log(v);
                        if (v !== undefined) {
                            acc.push({
                                from: v.id,
                                to: _nodesOuts[edge.to][outs.get(transition.output)].id,
                                transitions: new Set([[{ title: transition.title }]])
                            });
                        }
                    });
                }); }); });
                return acc;
            }, []);
            var edges = [];
            _edges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            for (var i = 0; i < _edges.length; i++) {
                var acc = [];
                var delta = 0;
                for (var j = i; j < _edges.length; j++) {
                    if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                        acc.push(Array.from(_edges[j].transitions)[0][0]);
                        delta++;
                    }
                }
                edges.push({
                    from: _edges[i].from,
                    to: _edges[i].to,
                    transitions: new Set([acc])
                });
                i += delta - 1;
            }
            var starts = _this.startStatements.map(function (stmt) { return stmt.id; });
            var nodes = _nodesOuts.reduce(function (acc, vs, index) {
                vs.forEach(function (v) {
                    if (v) {
                        acc.push(v);
                    }
                });
                return acc;
            }, []);
            var start = starts.reduce(function (acc, id) {
                var curNodeOuts = _nodesOuts[id].filter(function (v) {
                    if (v !== undefined) {
                        return v;
                    }
                });
                acc.push(curNodeOuts[0]);
                return acc;
            }, []);
            return {
                graphcore: { edges: edges, nodes: nodes },
                start: start
            };
        };
        _this.step = _this.oaStep;
        _this.run = _this.oaRun;
        return _this;
    }
    return Mealy;
}(OutputAutomata_1.OutputAutomata));
exports.Mealy = Mealy;
// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 0, isAdmit: false },
//             { id: 1, isAdmit: false },
//         ],
//         edges: [
//             { from: 0, to: 0, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//         ]
//     }, [{ id: 0, isAdmit: false }], [])
// console.log(nfa.isDeterministic())
// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 1, isAdmit: false },
//             { id: 2, isAdmit: false },
//             { id: 3, isAdmit: false },
//             { id: 4, isAdmit: false },
//         ],
//         edges: [
//             { from: 1, to: 1, transitions: new Set([[{ title: 'a', output: '1' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },
//             { from: 2, to: 4, transitions: new Set([[{ title: 'a', output: '1' }, { title: 'b', output: '1' }]]) },
//             // { from: 2, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },
//             { from: 3, to: 3, transitions: new Set([[{ title: 'b', output: '1' }]]) },
//             { from: 3, to: 2, transitions: new Set([[{ title: 'a', output: '1' }]]) },
//             { from: 4, to: 1, transitions: new Set([[{ title: 'b', output: '1' }]]) },
//             { from: 4, to:3, transitions: new Set([[{ title: 'a', output: '0' }]]) },
//         ]
//     }, [{ id: 1, isAdmit: false }], [])
// console.log(nfa.mealyToMoore().graphcore.edges)
// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 0, isAdmit: false },
//             { id: 1, isAdmit: false },
//             { id: 2, isAdmit: false },
//             { id: 3, isAdmit: false },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
//             { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },
//         ]
//     }, [{ id: 0, isAdmit: false }], [])
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
// nfa.mealyToMoore()
