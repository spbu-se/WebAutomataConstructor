"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
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
            console.log('outsoutsoutsoutsoutsouts');
            console.log(outs);
            console.log('outsoutsoutsoutsoutsouts');
            // interface NodeOut { node: NodeCore, out: Output, id: number }
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
            console.log();
            console.log();
            _nodesOuts.forEach(function (vs) {
                console.log(vs);
                console.log();
            });
            var _edges = _nodesOuts.reduce(function (acc, vs, index) {
                var edges = _this.edges.filter(function (edge) { return edge.from === _this.nodes[index].id; });
                console.log('AA', edges);
                edges.forEach(function (edge) { return edge.transitions.forEach(function (_) { return _.forEach(function (transition) {
                    console.log('AA', transition);
                    vs.forEach(function (v) {
                        console.log(v);
                        if (v !== undefined) {
                            console.log('AA', v.id);
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
            // forEach((vs, index) => {
            // })
            _edges.forEach(function (edge) { return console.log(edge.from, edge.to, edge.transitions); });
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
            console.log(edges);
            edges.forEach(function (edge) { return console.log(edge.from, edge.to, edge.transitions); });
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
                // _nodesOuts[id].forEach((v) => {
                //     if (v) { 
                //         acc.push(v)
                //     }
                // })  
                return acc;
            }, []);
            nodes.forEach(function (v) { return console.log(v); });
            return {
                graphcore: { edges: edges, nodes: nodes },
                start: start
            };
            // this.restart()
            // const startStmt = this.curPosition
            // const includes = (x: { node: statement, output: Output }, xs: { node: statement, output: Output }[]): boolean => {
            //     return xs.reduce((acc: boolean, curr) => (curr.node.id === x.node.id && curr.output === x.output) || acc, false)
            // }
            // const createOpenedStmts = (): { node: statement, output: Output, newId: number}[] => {
            //     const openedStmts: { node: statement, output: Output, newId: number }[] = []
            //     this.statements.forEach(_ => {
            //         this.matrix.forEach(vs => {
            //             vs.forEach(v => {
            //                 const tmp: { node: statement, output: Output } = { 
            //                     node: {
            //                         idLogic: v[0].idLogic,
            //                         isAdmit: v[0].isAdmit, 
            //                         output: v[0].output,
            //                         id: v[0].id
            //                     },
            //                     output: v[0].output!
            //                 }
            //                 if (!includes(tmp, openedStmts)) { 
            //                     openedStmts.push({
            //                         node: v[0],
            //                         output: v[0].output!,
            //                         newId: 0
            //                     })
            //                 }
            //             })
            //         } )
            //     })
            //     openedStmts.sort((a, b) => a.node.idLogic - b.node.idLogic)
            //     openedStmts.forEach((stmt, index) => stmt.newId = index)
            //     return openedStmts
            // }
            // const openedStmts = createOpenedStmts()
            // const getOpened = (id: number, output: Output): { node: statement, output: Output, newId: number} => {
            //     const eof = {node: {id: -1, idLogic: -1, isAdmit: false}, newId: -1, output: ""}
            //     const filtred = openedStmts.filter(v => v.node.idLogic === id && v.output === output) 
            //     return filtred.length > 0 ? filtred[0] : eof
            // } 
            // const matrix: { node: statement, output: Output, newId: number}[][] = []
            // openedStmts.forEach(stmt => {
            //     const tmp: { node: statement, output: Output, newId: number}[] = []
            //     this.alphabet.forEach(tr => {
            //         const lookedUp = this.cellMatrix(stmt.node.idLogic, tr)[0]
            //         tmp.push(getOpened(lookedUp.idLogic, lookedUp.output!))
            //     })
            //     matrix.push(tmp)
            // })
            // const nodes = openedStmts.reduce((acc: NodeCore[], stmt) => {
            //     acc.push({
            //         id: stmt.newId,
            //         isAdmit: stmt.node.isAdmit,
            //         output: stmt.output
            //     })
            //     return acc
            // }, [])
            // const matrixNodes = matrix.reduce((acc: NodeCore[][], vs) => {
            //     const tmp: NodeCore[] = []
            //     vs.forEach((v) => {
            //         tmp.push(nodes[v.newId])
            //     })
            //     acc.push(tmp)
            //     return acc
            // }, [])
            // const _edges: EdgeCore[] = []
            // nodes.forEach(node => {
            //     this.alphabet.forEach((tr, letter) => {
            //         _edges.push({
            //             from: node.id, 
            //             to: matrixNodes[node.id][tr].id, 
            //             transitions: new Set<TransitionParams[]>([[{title: letter}]])
            //         })
            //     })
            // })
            // _edges.sort((a, b) => a.from - b.from || a.to - b.to)
            // const edges: EdgeCore[] = []
            // for (let i = 0; i < _edges.length; i++) {
            //     const acc: TransitionParams[] = []
            //     let delta = 0
            //     for (let j = i; j < _edges.length; j++) {
            //         if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
            //             acc.push(Array.from(_edges[j].transitions)[0][0])
            //             delta++
            //         }
            //     }
            //     edges.push({
            //         from: _edges[i].from,
            //         to: _edges[i].to,
            //         transitions: new Set<TransitionParams[]>([acc])
            //     })
            //     i += delta - 1
            // }
            // const startOpened = openedStmts.filter(stmt => stmt.node.idLogic === startStmt[0].stmt.idLogic)[0]
            // const start = nodes[startOpened.newId]
            // return {
            //     graphcore: {
            //         edges: edges,
            //         nodes: nodes
            //     },
            //     start: [start]
            // }
        };
        return _this;
    }
    return Mealy;
}(OutputAutomata_1.OutputAutomata));
exports.Mealy = Mealy;
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
var nfa = new Mealy({
    nodes: [
        { id: 0, isAdmit: false },
        { id: 1, isAdmit: false },
        { id: 2, isAdmit: false },
        { id: 3, isAdmit: false },
    ],
    edges: [
        { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
        { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
        { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
        { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
        { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
        { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
        { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },
    ]
}, [{ id: 0, isAdmit: false }], []);
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
nfa.mealyToMoore();
