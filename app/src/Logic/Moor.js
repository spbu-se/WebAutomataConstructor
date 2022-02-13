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
var Moor = /** @class */ (function (_super) {
    __extends(Moor, _super);
    function Moor(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements, input) || this;
        _this.moorToMealy = function () {
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
            return {
                graphcore: { edges: mealyEdges, nodes: _this.nodes.map(function (node) { return ({ id: node.id, isAdmit: node.isAdmit }); }) },
                start: _this.startStatements.map(function (statement) { return ({ id: statement.id, isAdmit: statement.isAdmit }); })
            };
        };
        return _this;
    }
    return Moor;
}(OutputAutomata_1.OutputAutomata));
exports.Moor = Moor;
var nfa = new Moor({
    nodes: [
        { id: 0, isAdmit: false, output: '0' },
        { id: 1, isAdmit: false, output: '1' },
        { id: 2, isAdmit: false, output: '2' },
        { id: 3, isAdmit: false, output: '3' },
    ],
    edges: [
        { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
        { from: 1, to: 2, transitions: new Set([[{ title: '10' }]]) },
        { from: 2, to: 3, transitions: new Set([[{ title: '10' }]]) },
        { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },
    ]
}, [{ id: 0, isAdmit: false }], ["5"]);
// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
var conv = nfa.moorToMealy();
conv.graphcore.edges.forEach(function (edge) {
    console.log(edge.from);
    console.log(edge.to);
    console.log(edge.transitions);
});
conv.graphcore.nodes.forEach(function (node) {
    console.log(node);
});
