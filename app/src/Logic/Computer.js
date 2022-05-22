"use strict";
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
        this.historiStep = [];
        this.historiRun = [];
        this.matrix = [];
        this.byEmptyStackAdmt = function (isAdmt) {
            throw new Error("PDA attribute");
        };
        this.nfaToDfa = function () {
            throw new Error("DFA conversion");
        };
        this.minimizeDfa = function () {
            throw new Error("DFA conversion");
        };
        this.mooreToMealy = function () {
            throw new Error("Moor conversion");
        };
        this.mealyToMoore = function () {
            throw new Error("Moor conversion");
        };
        this.getCurrNode = function () {
            return _this.currentNode.id;
        };
        this.getStartStatements = function () {
            return _this.startStatements;
        };
        graph.edges
            .sort(function (a, b) { return a.from - b.from; })
            .forEach(function (value) { return _this.edges.push({
            transitions: value.transitions === undefined ? new Set([[{ title: "" }]]) : value.transitions,
            from: value.from,
            to: value.to,
            localValue: []
        }); });
        var _loop_1 = function (i) {
            this_1.edges[i].localValue = [];
            this_1.edges[i].transitions.forEach(function (value) {
                return value.forEach(function (value1) { return _this.edges[i].localValue.push(value1); });
            });
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
        this.createMatrix();
    }
    Computer.prototype.getInput = function () {
        return this.input;
    };
    Computer.prototype.getAlphabet = function () {
        return this.alphabet;
    };
    Computer.prototype.getAlphabetFromEdges = function () {
        var _this = this;
        var alphabetSet = new Set();
        for (var i_1 = 0; i_1 < this.edges.length; i_1++) {
            this.edges[i_1].localValue.forEach(function (value) {
                if (value.title !== "") {
                    alphabetSet.add(value.title);
                }
            });
        }
        var i = 0;
        alphabetSet.forEach(function (value) {
            if (value !== "") {
                _this.alphabet.set(value, i);
                i++;
            }
        });
    };
    Computer.prototype.getStatementsFromNodes = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {
                id: nodes[i].id,
                isAdmit: nodes[i].isAdmit,
                idLogic: i,
                output: nodes[i].output
            });
        }
    };
    Computer.prototype.createMatrix = function () {
        for (var i = 0; i < this.statements.size; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = [];
                //{idLogic: -1, id: -1, isAdmit: false, stackDown: "empty", stackPush: []}
            }
        }
        for (var i = 0; i < this.edges.length; i++) {
            var statementFrom = this.statements.get(this.edges[i].from);
            var statementTo = this.statements.get(this.edges[i].to);
            for (var j = 0; j < this.edges[i].localValue.length; j++) {
                var letterId = this.alphabet.get(this.edges[i].localValue[j].title);
                // if (letterId === undefined) {
                //     throw new Error("A")
                // }
                if (letterId === undefined) {
                    continue;
                }
                console.log(letterId);
                console.log(this.edges[i].localValue[j].title);
                var stDwn = this.edges[i].localValue[j].stackDown;
                var stPsh = this.edges[i].localValue[j].stackPush;
                var mv = this.edges[i].localValue[j].move;
                var output = this.edges[i].localValue[j].output === undefined ? statementTo.output : this.edges[i].localValue[j].output;
                if (stDwn === undefined || stPsh === undefined || stDwn === "" || stPsh.length === 0) {
                    stDwn = exports.EPS;
                    stPsh = [exports.EPS];
                }
                // console.log(statementTo.move)
                this.matrix[statementFrom.idLogic][letterId].push(__assign(__assign({}, statementTo), { stackDown: stDwn, stackPush: stPsh, move: mv, output: output }));
            }
        }
        this.alphabet.forEach(function (value, key) { return console.log(value, ' ', key); });
        this.statements.forEach(function (value) { return console.log(value); });
        this.matrix.forEach(function (value) {
            console.log();
            value.forEach(function (value1) { return console.log(value1); });
        });
    };
    Computer.prototype.cellMatrix = function (i, j) {
        return this.matrix[i][j];
    };
    return Computer;
}());
exports.Computer = Computer;
