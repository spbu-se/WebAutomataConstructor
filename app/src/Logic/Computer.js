"use strict";
exports.__esModule = true;
exports.eof = { isAdmit: false, idLogic: -1, id: -1 };
exports.EPS = 'Epsilon';
exports.BOTTOM = "Z0";
var Computer = /** @class */ (function () {
    function Computer(graph, startStatements) {
        var _this = this;
        this.input = [];
        this.alphabet = new Map();
        this.statements = new Map();
        this.startStatements = [];
        this.edges = [];
        this.counterSteps = 0;
        this.counterStepsForResult = 0;
        this.setStartStatements(graph, startStatements);
        graph.edges
            .sort(function (a, b) { return a.from - b.from; })
            .forEach(function (value) { return _this.edges.push({
            transitions: value.transitions,
            from: value.from,
            to: value.to,
            localValue: []
        }); });
        var _loop_1 = function (i) {
            this_1.edges[i].localValue = [];
            this_1.edges[i].transitions.forEach(function (value) {
                return value.forEach(function (value1) { return _this.edges[i].localValue.push(value1); });
            }
            //    this.edges[i].localValue!.push(value)
            );
        };
        var this_1 = this;
        for (var i = 0; i < this.edges.length; i++) {
            _loop_1(i);
        }
        this.getAlphabetFromEdges();
        this.getStatementsFromNodes(graph.nodes);
        this.startStatements = startStatements;
        this.currentNode = startStatements[0];
        this.nodes = graph.nodes;
    }
    Computer.prototype.getAlphabetFromEdges = function () {
        var _this = this;
        var alphabetSet = new Set();
        for (var i_1 = 0; i_1 < this.edges.length; i_1++) {
            this.edges[i_1].localValue.forEach(function (value) {
                alphabetSet.add(value.title);
            });
        }
        var i = 0;
        alphabetSet.forEach(function (value) {
            _this.alphabet.set(value, i);
            i++;
        });
    };
    Computer.prototype.getStatementsFromNodes = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, { id: nodes[i].id, isAdmit: nodes[i].isAdmit, idLogic: i });
        }
    };
    Computer.prototype.setStartStatements = function (graph, startStatements) {
        if (startStatements.length > 1 && this.alphabet.get(exports.EPS) === undefined) {
            this.alphabet.set(exports.EPS, this.alphabet.size);
            startStatements.forEach(function (value) { return startStatements.forEach(function (value1) {
                graph.edges.push({ from: value.id, to: value1.id, transitions: new Set([[{ title: exports.EPS }]]) });
                // graph.edges.push({from: value.id, to: value1.id, transitions: new Set<string>([EPS])})
            }); });
        }
    };
    return Computer;
}());
exports.Computer = Computer;
