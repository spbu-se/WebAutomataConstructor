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
var NFA = /** @class */ (function (_super) {
    __extends(NFA, _super);
    function NFA(graph, startStatement, input) {
        var _this = _super.call(this, graph, startStatement, input) || this;
        if (_this.haveEpsilon()) {
            throw new Error('Epsilon Transitions');
        }
        return _this;
    }
    return NFA;
}(EpsilonNFA_1.EpsilonNFA));
exports.NFA = NFA;
//
// let nfa = new NFA (
//     {
//         nodes: [
//             {id: 0, isAdmit: false},
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//
//         ],
//         edges: [
//             {from: 0, to: 0, transitions: new Set([ [{title: '0'}] ])},
//             {from: 0, to: 1, transitions: new Set([ [{title: '0'}] ])},
//             {from: 1, to: 2, transitions: new Set([ [{title: '1'}] ])},
//         ]
//     }, [{id: 0, isAdmit: false}], [],
// )
// nfa.nfaToDfa()
// nfa.nfaToDfa().nodes.forEach((v) => console.log(v.id))
// nfa.nfaToDfa().edges.forEach((v) => console.log(v.from, v.to))
