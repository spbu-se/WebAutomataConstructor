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
var EpsilonNFA_1 = require("./EpsilonNFA");
var Exceptions_1 = require("./Exceptions");
var DFA = /** @class */ (function (_super) {
    __extends(DFA, _super);
    function DFA(graph, startStatement, input) {
        var _this = _super.call(this, graph, startStatement, input) || this;
        _this.minimizeDfa = function () {
            _this.restart();
            var startId = _this.curPosition[0].stmt.idLogic;
            var cutBy = function (by) {
                var acc = [];
                _this.matrix.forEach(function (_, it) { return acc.push(_this.cellMatrix(it, by)[0]); });
                return acc;
            };
            var _lookUp = function (group) { return function (id) {
                return group[id];
            }; };
            var _getJump = function (table) { return function (by) { return function (id) {
                return table[by][id];
            }; }; };
            var createTableT = function (zero) {
                var lookUp = _lookUp(zero);
                var table = [];
                _this.alphabet.forEach(function (tr) {
                    var acc = [];
                    var cutted = cutBy(tr);
                    cutted.forEach(function (cell) {
                        acc.push(lookUp(cell.idLogic));
                    });
                    table.push(acc);
                });
                return table;
            };
            var _updateGroups = function (zero) { return function (groups) { return function (getJump) { return function (group) {
                var jmpGrp = getJump(group[0].node.idLogic).number;
                var newGrp = [];
                var newNumber = groups.length + 1;
                var toRm = [];
                group.forEach(function (value, index) {
                    if (getJump(value.node.idLogic).number !== jmpGrp) {
                        value.number = newNumber;
                        toRm.push(value.node.idLogic);
                        newGrp.push(value);
                    }
                });
                for (var i = 0; i < group.length; i++) {
                    if (toRm.includes(group[i].node.idLogic)) {
                        group.splice(i, 1);
                        i--;
                    }
                }
                if (newGrp.length > 0) {
                    groups.push(newGrp);
                    return { fst: group, snd: newGrp };
                }
                return { fst: [], snd: [] };
            }; }; }; };
            var stack = [];
            var pop = function () { return stack.shift(); };
            var push = function (v) { return stack.push(v); };
            var zero = [];
            var first = [];
            var second = [];
            _this.statements.forEach(function (statement) {
                var element = { number: -1, node: { idLogic: -1, id: -1, isAdmit: false } };
                if (statement.isAdmit) {
                    element = { number: 1, node: statement };
                    first.push(element);
                }
                else {
                    element = { number: 2, node: statement };
                    second.push(element);
                }
                zero.push(element);
            });
            var byEveryLetter = _this.matrix.reduce(function (acc, line) {
                return acc && line.reduce(function (accLine, cells) { return accLine && cells.length > 0; }, acc);
            }, true);
            if (first.length < 1 || !byEveryLetter) {
                // console.log('CATHTHT')
                throw new Exceptions_1.NonMinimizable();
            }
            // плюс если есть пробелы в таблице!
            var groups = [];
            groups.push(first);
            groups.push(second);
            var table = createTableT(zero);
            _this.alphabet.forEach(function (tr) {
                groups.forEach(function (stmt) { return push(stmt); });
                var getJump = _getJump(table)(tr);
                var updateGroups = _updateGroups(zero)(groups)(getJump);
                while (stack.length > 0) {
                    var head = pop();
                    if (head === undefined) {
                        break;
                    }
                    var newGrp = updateGroups(head);
                    if (newGrp.fst.length > 0) {
                        push(newGrp.fst);
                        push(newGrp.snd);
                    }
                }
            });
            var toPositions = function (group) { return group.map(function (g) { return ({ stmt: g.node }); }); };
            var grpAfterJmp = function (group, by) { return _getJump(table)(by)(group[0].node.idLogic).number; };
            var nodes = groups.map(function (group) { return ({ id: group[0].number, isAdmit: _this.haveAdmitting(toPositions(group)) }); });
            var edges = groups.reduce(function (acc, g) {
                _this.alphabet.forEach(function (tr, letter) {
                    acc.push({
                        from: g[0].number,
                        to: grpAfterJmp(g, tr),
                        transitions: new Set([[{ title: letter }]])
                    });
                });
                return acc;
            }, []);
            edges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            var newEdges = [];
            for (var i = 0; i < edges.length; i++) {
                var acc = [];
                var delta = 0;
                var j = i;
                var _loop_1 = function () {
                    var tmp = '';
                    edges[j].transitions.forEach(function (_) { return _.forEach(function (v) { return tmp = v.title; }); });
                    acc.push({ title: tmp });
                    j++;
                };
                while (j < edges.length && edges[i].from === edges[j].from && edges[i].to === edges[j].to) {
                    _loop_1();
                }
                i = j - 1;
                newEdges.push({
                    from: edges[i].from,
                    to: edges[i].to,
                    transitions: new Set([acc])
                });
            }
            var startGrp = groups.filter(function (g) {
                var gIds = g.map(function (v) { return v.node.idLogic; });
                return gIds.includes(startId);
            });
            var start = nodes[startGrp[0][0].number - 1];
            return { graphcore: { nodes: nodes, edges: newEdges }, start: start };
        };
        _this.step = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1.NonDeterministic();
            }
            return _this.enfaStep();
        };
        _this.run = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1.NonDeterministic();
            }
            return _this.enfaRun();
        };
        _this.setInput(input);
        return _this;
    }
    return DFA;
}(EpsilonNFA_1.EpsilonNFA));
exports.DFA = DFA;
// let nfa = new DFA (
//         {
//             nodes: [
//                 {id: 1, isAdmit: false},
//                 {id: 2, isAdmit: true},
//             ],
//             edges: [
//                 {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
//                 {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             ]
//         }, [{id: 1, isAdmit: false}], [],
//     )
// nfa.
// let nfa = new DFA (
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: true},
//
//
//             // {id: 1, isAdmit: false},
//             // {id: 2, isAdmit: true},
//             // {id: 3, isAdmit: false},
//             // {id: 4, isAdmit: true},
//             // {id: 5, isAdmit: true},
//             // {id: 6, isAdmit: false},
//
//             // {id: 0, isAdmit: false},
//             // {id: 1, isAdmit: false},
//             // {id: 2, isAdmit: false},
//             // {id: 3, isAdmit: false},
//             // {id: 4, isAdmit: true},
//             // {id: 5, isAdmit: true},
//             // {id: 6, isAdmit: false},
//
//
//         ],
//         edges: [
//
//             {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
//
//             //youtube
//             // {from: 1, to: 5, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 1, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 2, to: 6, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 2, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 3, to: 6, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 3, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 4, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 4, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 5, to: 2, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 5, to: 3, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 6, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 6, to: 3, transitions: new Set([ [{title: 'b'}] ])},
//
//
//             // {from: 0, to: 1, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 0, to: 3, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 1, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 2, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 5, to: 5, transitions: new Set([ [{title: '0'}, {title: '1'}] ])},
//             // {from: 3, to: 0, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 3, to: 4, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 4, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 4, to: 2, transitions: new Set([ [{title: '0'}] ])},
//
//             //refference
//             // {from: 0, to: 1, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 0, to: 2, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 1, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 1, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 2, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 2, to: 5, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 3, to: 3, transitions: new Set([ [{title: 'a'}, {title: 'b'}] ])},
//             // {from: 4, to: 4, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 4, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 5, to: 5, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 5, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 6, to: 6, transitions: new Set([ [{title: 'a'}, {title: 'b'}] ])},
//
//         ]
//     }, [{id: 1, isAdmit: false}], [],
// )
// console.log(nfa.minimizeDfa().start)
