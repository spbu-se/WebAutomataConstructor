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
            var outNumbs = [];
            outs.forEach(function (v, k) { return outNumbs.push(k); });
            console.log(outs);
            console.log(outNumbs);
            var diffEdges = _this.edges.reduce((function (acc, edge) {
                var tmp = [];
                edge.transitions.forEach(function (t) { return t.forEach(function (v) { return tmp.push({
                    from: edge.from,
                    to: edge.to,
                    title: v.title,
                    output: v.output ? v.output : ''
                }); }); });
                tmp.forEach(function (v) { return acc.push(v); });
                return acc;
            }), new Array());
            console.log('UUUU');
            diffEdges.forEach(function (v) {
                console.log(v);
            });
            console.log('UU->I');
            var toOuts = new Map();
            _this.nodes.forEach(function (v) {
                return toOuts.set(v.id, new Array(outs.size).fill(-1));
            });
            var count = 1;
            diffEdges.forEach(function (edge) {
                if (toOuts.get(edge.to) === undefined) {
                    throw new Error("Mealy to Moore");
                }
                else {
                    if (toOuts.get(edge.to)[outs.get(edge.output)] === -1) {
                        toOuts.get(edge.to)[outs.get(edge.output)] = count;
                        count++;
                    }
                }
            });
            var nodesMoore = [];
            toOuts.forEach(function (v, key) { return v
                .map(function (v, k) { return ({ value: v, out: outNumbs[k] }); })
                .filter(function (v) { return v.value !== -1; })
                .forEach(function (v) {
                nodesMoore.push(__assign(__assign({}, _this.nodes.find(function (node) { return node.id === key; })), { id: v.value, output: v.out }));
            }); });
            console.log('LLKLKLKLLLKLL');
            nodesMoore.forEach(function (v) { return console.log(v); });
            console.log('LLKLKLKLLLKLL');
            toOuts.forEach(function (v, key) {
                console.log(key + ' ~~~ ' + v);
            });
            var outEdges = diffEdges.reduce(function (acc, v) {
                if (toOuts.get(v.from) === undefined) {
                    throw new Error("Mealy to Moore");
                }
                else {
                    var mooreIds = toOuts.get(v.from).filter(function (id) { return id !== -1; });
                    mooreIds.forEach(function (id) {
                        var idLetter = outs.get(v.output);
                        acc.push({
                            from: id,
                            to: toOuts.get(v.to)[idLetter],
                            title: v.title
                        });
                    });
                    return acc;
                }
            }, new Array());
            console.log('________');
            outEdges.forEach(function (v) { return console.log(v); });
            console.log('________');
            console.log('vsdfsdfsdf');
            var startNodes = _this.startStatements.map(function (v) { return _this.nodes[v.id]; });
            var startMoore = [];
            startNodes.forEach(function (v) { var _a; return (_a = toOuts.get(v.id)) === null || _a === void 0 ? void 0 : _a.filter(function (v) { return v !== -1; }).forEach(function (v) { return startMoore.push(nodesMoore.find(function (node) { return node.id === v; })); }); });
            startNodes.forEach(function (v) { return console.log(v); });
            console.log('vsdfsdfsdf---||||--');
            var edgesMoore = [];
            outEdges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            console.log('vvvvvvvvvvvvvv');
            outEdges.forEach(function (v) { return console.log(v); });
            console.log('^^^^^^^^^^^^^^');
            for (var i = 0; i < outEdges.length; i++) {
                var acc = [];
                var delta = 0;
                var j = i;
                while (j < outEdges.length && outEdges[i].from === outEdges[j].from && outEdges[i].to === outEdges[j].to) {
                    acc.push({ title: outEdges[j].title });
                    j++;
                }
                i = j - 1;
                edgesMoore.push({
                    from: outEdges[i].from,
                    to: outEdges[i].to,
                    transitions: new Set([acc])
                });
                // for (let j = i; j < outEdges.length; j++) {
                //     if (outEdges[i].from === outEdges[j].from && outEdges[i].to === outEdges[j].to) {
                //         acc.push({ title: outEdges[j].title })
                //         delta++
                //     }
                //     edgesMoore.push({
                //         from: outEdges[i].from,
                //         to: outEdges[i].to,
                //         transitions: new Set<TransitionParams[]>([acc])
                //     })
                //     i += delta - 1
                // }
            }
            console.log('{{{{{{{v}}}}}}}');
            edgesMoore.forEach(function (v) {
                console.log(v);
            });
            console.log('{{{{{{{v}}}}}}}');
            // for (let i = 0; i < outEdges.length; i++) {
            //     const acc: TransitionParams[] = []
            //     let delta = 0
            //     for (let j = i; j < outEdges.length; j++) {
            //         if (outEdges[i].from === outEdges[j].from && outEdges[i].to === outEdges[j].to) {
            //             acc.push(Array.from(outEdges[j].transitions)[0][0])
            //             delta++
            //         }
            //     }
            //     outEdges.push({
            //         from: outEdges[i].from,
            //         to: outEdges[i].to,
            //         transitions: new Set<TransitionParams[]>([acc])
            //     })
            //     i += delta - 1
            // }
            // const nodesOuts = () => {
            //     let counter = 0
            //     return this.nodes.reduce((acc: (NodeCore | undefined)[][], node: NodeCore) => {
            //         const edges = this.edges.filter((edge) => edge.to === node.id)
            //         const tmp: (NodeCore | undefined)[] = []
            //         outs.forEach(() => tmp.push(undefined))
            //         edges.forEach((edge) => {
            //             edge.transitions.forEach((_) => _.forEach((transition) => {
            //                 const out = transition.output!
            //                 const outIndex = outs.get(out)!
            //                 if (!tmp[outIndex]) {
            //                     tmp[outIndex] = {
            //                         id: counter,
            //                         isAdmit: node.isAdmit,
            //                         output: out
            //                     }
            //                     counter++
            //                 }
            //             }))
            //         })
            //         if (tmp.filter((v) => v !== undefined).length === 0) {
            //             tmp[0] = {
            //                 id: counter,
            //                 isAdmit: node.isAdmit,
            //                 output: "~"
            //             }
            //             counter++
            //         }
            //         acc.push(tmp)
            //         return acc
            //     }, [])
            // }
            // const _nodesOuts: (NodeCore | undefined)[][] = nodesOuts()
            // const _edges = _nodesOuts.reduce((acc: EdgeCore[], vs, index) => {
            //     const edges = this.edges.filter((edge) => edge.from === this.nodes[index].id)
            //     edges.forEach((edge) => edge.transitions.forEach((_) => _.forEach(transition => {
            //         vs.forEach((v) => {
            //             console.log(v)
            //             if (v !== undefined && transition.output !== undefined) {
            //                 const out = outs.get(transition.output)
            //                 if (out) {
            //                     const ndesOut = _nodesOuts[edge.to][out]
            //                     if (ndesOut) {
            //                         acc.push({
            //                             from: v.id,
            //                             to: ndesOut.id,
            //                             transitions: new Set<TransitionParams[]>([[{ title: transition.title }]])
            //                         })
            //                     }
            //                 }
            //             }
            //         })
            //     })))
            //     return acc
            // }, [])
            // const edges: EdgeCore[] = []
            // _edges.sort((a, b) => a.from - b.from || a.to - b.to)
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
            // const starts = this.startStatements.map((stmt) => stmt.id)
            // const nodes = _nodesOuts.reduce((acc: NodeCore[], vs, index) => {
            //     vs.forEach((v) => {
            //         if (v) {
            //             acc.push(v)
            //         }
            //     })
            //     return acc
            // }, [])
            // const start = starts.reduce((acc: NodeCore[], id) => {
            //     const curNodeOuts = _nodesOuts[id].filter((v) => {
            //         if (v !== undefined) {
            //             return v
            //         }
            //     })
            //     acc.push(curNodeOuts[0]!)
            //     return acc
            // }, [])
            return {
                graphcore: { edges: edgesMoore, nodes: nodesMoore },
                start: startMoore
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
var nfa = new Mealy({
    nodes: [
        { id: 1, isAdmit: false },
        { id: 2, isAdmit: false },
        { id: 3, isAdmit: false },
        { id: 4, isAdmit: false },
    ],
    edges: [
        // { from: 1, to: 1, transitions: new Set([[{ title: 'a', output: '1' }]]) },
        // { from: 1, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },
        // {
        //     from: 2, to: 4, transitions: new Set([[
        //         { title: 'a', output: '1' },
        //         { title: 'b', output: '1' },
        //     ]])
        // },
        // { from: 3, to: 2, transitions: new Set([[{ title: 'a', output: '1' }]]) },
        // { from: 3, to: 3, transitions: new Set([[{ title: 'b', output: '1' }]]) },
        // { from: 4, to: 3, transitions: new Set([[{ title: 'a', output: '0' }]]) },
        // { from: 4, to: 1, transitions: new Set([[{ title: 'b', output: '1' }]]) },
        { from: 1, to: 2, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
        { from: 1, to: 4, transitions: new Set([[{ title: 't', output: 'n' }]]) },
        { from: 2, to: 3, transitions: new Set([[{ title: 't', output: 'n' }]]) },
        { from: 2, to: 4, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
        { from: 3, to: 1, transitions: new Set([[{ title: 'f', output: '0' }, { title: 't', output: '5' }]]) },
        { from: 4, to: 3, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
        { from: 4, to: 1, transitions: new Set([[{ title: 't', output: '0' }]]) },
    ]
}, [{ id: 1, isAdmit: false }], []);
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
var a = nfa.mealyToMoore();
console.log(a);
