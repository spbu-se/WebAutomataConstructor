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
exports.EpsilonNFA = void 0;
var PDA_1 = require("./PDA");
var EpsilonNFA = /** @class */ (function (_super) {
    __extends(EpsilonNFA, _super);
    function EpsilonNFA(graph, startStatement, input) {
        var _this = _super.call(this, graph, startStatement, input) || this;
        _this.enfaStep = function () {
            var _a;
            var ret = _this._step(_this.counterSteps, _this.alphabet.get((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value), _this.historiStep);
            _this.counterSteps = ret.counter;
            _this.historiStep = ret.history;
            ret.nodes.forEach(function (value) { return value.stack = undefined; });
            ret.history.forEach(function (value) { return value.nodes.forEach(function (value1) { return value1.stack = undefined; }); });
            return ret;
        };
        _this.enfaRun = function () {
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            for (var i = 0; i < _this.input.length - 1; i++) {
                var tmp = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun);
                _this.counterStepsForResult = tmp.counter;
                _this.historiRun = tmp.history;
            }
            var ret = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun);
            ret.nodes.forEach(function (value) { return value.stack = undefined; });
            ret.history.forEach(function (value) { return value.nodes.forEach(function (value1) { return value1.stack = undefined; }); });
            return ret;
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
