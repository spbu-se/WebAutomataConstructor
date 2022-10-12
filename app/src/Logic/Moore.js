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
exports.Moore = void 0;
var OutputAutomata_1 = require("./OutputAutomata");
var Moore = /** @class */ (function (_super) {
    __extends(Moore, _super);
    function Moore(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements, input) || this;
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
        _this.mooreToMealy = function () {
            var mapNodes = new Map();
            _this.nodes.forEach(function (node) { return mapNodes.set(node.id, { id: node.id, isAdmit: node.isAdmit, output: node.output }); });
            var mealyEdges = _this.edges.map(function (edge) {
                var tmpTransitions = new Set();
                var tmpTransiton = [];
                edge.transitions.forEach(function (v) { return v.forEach(function (transition) {
                    var _a;
                    tmpTransiton.push({ title: transition.title, output: (_a = mapNodes.get(edge.to)) === null || _a === void 0 ? void 0 : _a.output });
                }); });
                tmpTransitions.add(tmpTransiton);
                return { from: edge.from, to: edge.to, transitions: tmpTransitions };
            });
            console.log('>>>>', _this.startStatements);
            return {
                graphcore: { edges: mealyEdges, nodes: _this.nodes.map(function (node) { return ({ id: node.id, isAdmit: node.isAdmit }); }) },
                start: _this.startStatements.map(function (statement) { return ({ id: statement.id, isAdmit: statement.isAdmit }); })
            };
        };
        _this.step = _this.oaStep;
        // (): Step => {
        //     if (!super.isDeterministic()) {
        //         throw new NonDeterministic()
        //     }
        //     return this.oaRun()
        // }
        _this.run = _this.oaRun;
        return _this;
    }
    return Moore;
}(OutputAutomata_1.OutputAutomata));
exports.Moore = Moore;
var nfa = new Moore({
    nodes: [
        { id: 0, isAdmit: false, output: 'b' },
        { id: 1, isAdmit: false, output: 'b' },
        // { id: 2, isAdmit: false, output: 'a' },
        // { id: 3, isAdmit: false, output: '3' },
    ],
    edges: [
        // { from: 0, to: 0, transitions: new Set([[{ title: '1' }]]) },
        { from: 0, to: 1, transitions: new Set([[{ title: '0' }]]) },
        { from: 0, to: 0, transitions: new Set([[{ title: '0' }]]) },
        // { from: 1, to: 1, transitions: new Set([[{ title: '0' }]]) },
        // { from: 1, to: 2, transitions: new Set([[{ title: '1' }]]) },
        // { from: 2, to: 1, transitions: new Set([[{ title: '0' }]]) },
        // { from: 2, to: 0, transitions: new Set([[{ title: '1' }]]) },
    ]
}, [{ id: 0, isAdmit: false }], ["0"]);
console.log("It's petri run \n ".concat(nfa.run()));
console.log("It's petri step \n ".concat(nfa.step()));
// console.log(nfa.run())
// console.log(nfa.mooreToMealy().start)
// edges.forEach(v => console.log(v.from, v.to, v.transitions))
console.log(nfa.run());
// const conv = nfa.moorToMealy()
// conv.graphcore.edges.forEach(edge => {
//     console.log(edge.from)
//     console.log(edge.to)
//     console.log(edge.transitions)
// })
// conv.graphcore.nodes.forEach(node => {
//     console.log(node)
// })
