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
