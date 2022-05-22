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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var PDA_1 = require("./PDA");
var Computer_1 = require("./Computer");
var Stack_1 = require("./Stack");
var EpsilonNFA = /** @class */ (function (_super) {
    __extends(EpsilonNFA, _super);
    function EpsilonNFA(graph, startStatement, input) {
        var _this = _super.call(this, graph, startStatement, input) || this;
        _this.enfaStep = function () {
            var _a;
            var histUnit = [];
            var ret = _this._step(_this.counterSteps, _this.alphabet.get((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value), _this.historiStep, histUnit, []);
            _this.counterSteps = ret.counter;
            _this.historiStep = ret.history;
            ret.nodes.forEach(function (value) { return value.stack = undefined; });
            ret.history.forEach(function (value) { return value.nodes.forEach(function (value1) { return value1.stack = undefined; }); });
            return ret;
        };
        _this.enfaRun = function () {
            var histUnit = [];
            var histTrace = [];
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            for (var i = 0; i < _this.input.length - 1; i++) {
                var tmp = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun, histUnit, []);
                _this.counterStepsForResult = tmp.counter;
                _this.historiRun = tmp.history;
                histTrace.push({ byEpsPred: tmp.byEpsPred, byLetter: tmp.byLetter, byEpsAfter: tmp.byEpsAfter });
            }
            var ret = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun, histUnit, []);
            histTrace.push({ byEpsPred: ret.byEpsPred, byLetter: ret.byLetter, byEpsAfter: ret.byEpsAfter });
            ret.nodes.forEach(function (value) { return value.stack = undefined; });
            ret.history.forEach(function (value) { return value.nodes.forEach(function (value1) { return value1.stack = undefined; }); });
            console.log('histTrace');
            console.log(histTrace);
            console.log('histTrace');
            return __assign(__assign({}, ret), { histTrace: histTrace });
        };
        _this.nfaToDfa = function () {
            var startIds = _this.startStatements.map(function (v) { return v.id; });
            var fakeEdges = __spreadArrays(_this.edges);
            startIds.forEach(function (v) { return fakeEdges.push({
                from: 999,
                to: v,
                transitions: new Set([[{ title: Computer_1.EPS }]]),
                localValue: []
            }); });
            var fakeStart = { id: 999, isAdmit: false };
            var fakeNodes = __spreadArrays([fakeStart], _this.nodes);
            var fakeAutomat = new EpsilonNFA({ edges: fakeEdges, nodes: fakeNodes }, [fakeStart], []);
            console.log(fakeAutomat);
            var nextStepPosition = function (position, by) {
                return fakeAutomat.cellMatrix(position.stmt.idLogic, by).map(function (v) { return ({ stmt: v }); });
            };
            var _nextStepPositions = function (positions, by) {
                var acc = [];
                positions.map(function (v) {
                    return nextStepPosition(v, by);
                }).forEach(function (ps) {
                    return ps.forEach(function (p) { return acc.push(p); });
                });
                return acc;
            };
            var nextStepPositions = function (positions, by) {
                var afterEps = function (positions) {
                    if (fakeAutomat.epsId === undefined) {
                        return positions;
                    }
                    var acc = [];
                    var EPStack = new Stack_1.Stack();
                    EPStack.push(Computer_1.EPS);
                    positions.forEach(function (position) {
                        var tmp = fakeAutomat.epsilonStep(position.stmt.idLogic, Computer_1.EPS, EPStack, []);
                        if (tmp !== undefined) {
                            acc.push(tmp);
                        }
                    });
                    var flatted = [];
                    acc.forEach(function (ps) { return ps.forEach(function (p) { return flatted.push(p); }); });
                    return flatted;
                };
                return afterEps(_nextStepPositions(afterEps(positions), by));
            };
            var pop = function () { return stack.shift(); };
            var push = function (v) {
                stack.push(v);
            };
            // this.restart()
            fakeAutomat.restart();
            var stack = [];
            var table = [];
            var set = new PDA_1.ImSet();
            // const startPos = this.curPosition
            var startPos = fakeAutomat.curPosition;
            push(startPos);
            var _loop_1 = function () {
                var head = pop();
                var acc = [];
                if (head === undefined || head.length < 1) {
                    return "break";
                }
                if (set.has(head)) {
                    return "continue";
                }
                set.add(head.map(function (v) { return ({
                    stmt: {
                        id: v.stmt.id,
                        idLogic: v.stmt.idLogic,
                        isAdmit: v.stmt.isAdmit
                    },
                    stack: undefined
                }); }));
                fakeAutomat.getAlphabet().forEach(function (value) {
                    if (value !== fakeAutomat.epsId) {
                        var to = nextStepPositions(head, value);
                        var wasPushed_1 = [];
                        var __to = to.map(function (v) {
                            if (wasPushed_1.includes(v.stmt.idLogic)) {
                                return { stmt: { id: -100, idLogic: -100, isAdmit: false }, stack: undefined };
                            }
                            wasPushed_1.push(v.stmt.idLogic);
                            return ({
                                stmt: {
                                    id: v.stmt.id,
                                    idLogic: v.stmt.idLogic,
                                    isAdmit: v.stmt.isAdmit
                                },
                                stack: undefined
                            });
                        });
                        var _to = __to.filter(function (v) { return (v === null || v === void 0 ? void 0 : v.stmt.idLogic) !== -100; });
                        acc.push(_to);
                        if (to.length > 0 && !set.has(to) && !set.has(_to)) {
                            push(_to);
                        }
                    }
                });
                table.push(acc);
                console.log('OOOOOOOOOO');
                stack.forEach(function (v) { return v.forEach(function (vv) { return console.log(vv); }); });
                console.log('LLLL');
                set.getStorage().forEach(function (v) { return v.forEach(function (vv) { return console.log(vv); }); });
                console.log('LLLL');
                console.log();
            };
            while (stack.length > 0) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
            var _edges = [];
            table.forEach(function (ps, from) {
                fakeAutomat.getAlphabet().forEach(function (tr, letter) {
                    if (tr !== fakeAutomat.epsId && ps[tr].length !== 0) {
                        _edges.push({
                            from: from,
                            to: set.getIter(ps[tr]),
                            transitions: new Set([[{ title: letter }]])
                        });
                    }
                });
            });
            var nodes = set.getStorage().map(function (v) { return ({
                id: set.getIter(v),
                isAdmit: fakeAutomat.haveAdmitting(v)
            }); });
            var edges = [];
            _edges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            var newEdges = [];
            for (var i = 0; i < _edges.length; i++) {
                var acc = [];
                var delta = 0;
                var j = i;
                var _loop_2 = function () {
                    var tmp = '';
                    _edges[j].transitions.forEach(function (_) { return _.forEach(function (v) { return tmp = v.title; }); });
                    acc.push({ title: tmp });
                    j++;
                };
                while (j < _edges.length && _edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                    _loop_2();
                }
                i = j - 1;
                edges.push({
                    from: _edges[i].from,
                    to: _edges[i].to,
                    transitions: new Set([acc])
                });
            }
            return { nodes: nodes, edges: edges };
        };
        _this.step = _this.enfaStep;
        _this.run = _this.enfaRun;
        return _this;
    }
    return EpsilonNFA;
}(PDA_1.PDA));
exports.EpsilonNFA = EpsilonNFA;
// let nfa = new EpsilonNFA (
//     {
//         nodes: [
//             {id: 0, isAdmit: false},
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//             {id: 3, isAdmit: false},
//             {id: 4, isAdmit: false},
//             // {id: 2, isAdmit: false},
//
//         ],
//         edges: [
//             // {from: 0, to: 0, transitions: new Set([ [{title: 'a'}, {title: 'b'}] ])},
//             {from: 0, to: 1, transitions: new Set([ [{title: EPS}] ])},
//             {from: 1, to: 2, transitions: new Set([ [{title: "a"}] ])},
//             {from: 2, to: 3, transitions: new Set([ [{title: "a"}] ])},
//             {from: 3, to: 4, transitions: new Set([ [{title: "a"}] ])},
//             // {from: 1, to: 2, transitions: new Set([ [{title: EPS}] ])},
//         ]
//     }, [{id: 0, isAdmit: false}, {id: 3, isAdmit: false}], ['a', 'a'],
// )
// console.log(nfa.step())
// console.log(nfa.step())
// nfa.nfaToDfa()
//
// let nfa = new EpsilonNFA(
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//             {id: 3, isAdmit: false},
//             {id: 4, isAdmit: false},
//             {id: 5, isAdmit: false},
//             {id: 6, isAdmit: false},
//             {id: 7, isAdmit: false},
//             {id: 8, isAdmit: false},
//             {id: 9, isAdmit: false},
//             {id: 10, isAdmit: false},
//             {id: 11, isAdmit: false},
//             {id: 12, isAdmit: false},
//
//         ],
//         edges: [
//             {from: 1, to: 2, transitions: new Set([     {title:      EPS}])},
//             {from: 1, to: 8, transitions: new Set([     {title:      EPS }])},
//             {from: 2, to: 3, transitions: new Set([     {title:      EPS }])},
//             {from: 2, to: 9, transitions: new Set([     {title:      EPS }])},
//             {from: 3, to: 4, transitions: new Set([     {title:      EPS }])},
//             {from: 3, to: 6, transitions: new Set([     {title:      EPS }])},
//             {from: 4, to: 5, transitions: new Set([     {title:      'a' }])},
//             {from: 5, to: 4, transitions: new Set([     {title:      EPS }])},
//             {from: 5, to: 6, transitions: new Set([     {title:      EPS }])},
//             {from: 6, to: 7, transitions: new Set([     {title:      EPS }])},
//             {from: 7, to: 2, transitions: new Set([     {title:      EPS }])},
//             {from: 7, to: 8, transitions: new Set([     {title:      EPS }])},
//             {from: 9, to: 10, transitions: new Set([    {title:      EPS }])},
//             {from: 9, to: 12, transitions: new Set([    {title:      EPS }])},
//             {from: 10, to: 11, transitions: new Set([   {title:      'b' }])},
//             {from: 11, to: 10, transitions: new Set([   {title:      EPS }])},
//             {from: 11, to: 12, transitions: new Set([   {title:      EPS }])},
//             {from: 12, to: 7, transitions: new Set([    {title:      EPS }])},
//
//
//
//
//
//
//             //
//             // {from: 1, to: 3, transitions: new Set([{title: EPS}])},
//             // {from: 2, to: 4, transitions: new Set([{title: '0'}])},
//             // {from: 4, to: 5, transitions: new Set([{title: '1'}])},
//             // {from: 5, to: 6, transitions: new Set([{title: '1'}])},
//             // {from: 3, to: 7, transitions: new Set([{title: '1'}])},
//             // {from: 7, to: 8, transitions: new Set([{title: '0'}])},
//             // {from: 8, to: 9, transitions: new Set([{title: '1'}])},
//             // {from: 9, to: 9, transitions: new Set([{title: '0'}])},
//             // {from: 9, to: 9, transitions: new Set([{title: '1'}])},
//             //
//             // {from: 6, to: 6, transitions: new Set([{title: '0'}])},
//             // {from: 6, to: 6, transitions: new Set([{title: '1'}])},
//         ]
//     }, [{id: 1, isAdmit: false}], ['a', 'b'])
// console.log(nfa.step())
// console.log(nfa.step())
