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
            _this.restart();
            var startStmt = _this.curPosition;
            var includes = function (x, xs) {
                return xs.reduce(function (acc, curr) { return (curr.node.id === x.node.id && curr.output === x.output) || acc; }, false);
            };
            var createOpenedStmts = function () {
                var openedStmts = [];
                _this.statements.forEach(function (_) {
                    _this.matrix.forEach(function (vs) {
                        vs.forEach(function (v) {
                            var tmp = {
                                node: {
                                    idLogic: v[0].idLogic,
                                    isAdmit: v[0].isAdmit,
                                    output: v[0].output,
                                    id: v[0].id
                                },
                                output: v[0].output
                            };
                            if (!includes(tmp, openedStmts)) {
                                openedStmts.push({
                                    node: v[0],
                                    output: v[0].output,
                                    newId: 0
                                });
                            }
                        });
                    });
                });
                openedStmts.sort(function (a, b) { return a.node.idLogic - b.node.idLogic; });
                openedStmts.forEach(function (stmt, index) { return stmt.newId = index; });
                return openedStmts;
            };
            var openedStmts = createOpenedStmts();
            var getOpened = function (id, output) {
                var eof = { node: { id: -1, idLogic: -1, isAdmit: false }, newId: -1, output: "" };
                var filtred = openedStmts.filter(function (v) { return v.node.idLogic === id && v.output === output; });
                return filtred.length > 0 ? filtred[0] : eof;
            };
            var matrix = [];
            openedStmts.forEach(function (stmt) {
                var tmp = [];
                _this.alphabet.forEach(function (tr) {
                    var lookedUp = _this.cellMatrix(stmt.node.idLogic, tr)[0];
                    tmp.push(getOpened(lookedUp.idLogic, lookedUp.output));
                });
                matrix.push(tmp);
            });
            var nodes = openedStmts.reduce(function (acc, stmt) {
                acc.push({
                    id: stmt.newId,
                    isAdmit: stmt.node.isAdmit,
                    output: stmt.output
                });
                return acc;
            }, []);
            var matrixNodes = matrix.reduce(function (acc, vs) {
                var tmp = [];
                vs.forEach(function (v) {
                    tmp.push(nodes[v.newId]);
                });
                acc.push(tmp);
                return acc;
            }, []);
            var _edges = [];
            nodes.forEach(function (node) {
                _this.alphabet.forEach(function (tr, letter) {
                    _edges.push({
                        from: node.id,
                        to: matrixNodes[node.id][tr].id,
                        transitions: new Set([[{ title: letter }]])
                    });
                });
            });
            _edges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            var edges = [];
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
            var startOpened = openedStmts.filter(function (stmt) { return stmt.node.idLogic === startStmt[0].stmt.idLogic; })[0];
            var start = nodes[startOpened.newId];
            return {
                graphcore: {
                    edges: edges,
                    nodes: nodes
                },
                start: [start]
            };
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
}, [{ id: 0, isAdmit: false }], ["10", "10"]);
// console.log(nfa.run())
console.log(nfa.step());
console.log(nfa.step());
