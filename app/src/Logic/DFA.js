"use strict";
exports.__esModule = true;
exports.DFA = exports.eof = void 0;
exports.eof = { isAdmit: false, idLogic: -1, id: -1 };
var DFA = /** @class */ (function () {
    function DFA(graph, startStatement, input) {
        var _this = this;
        this.matrix = [];
        this.input = [];
        this.alphabet = new Map();
        this.statements = new Map();
        this.getStatementsFromNodes = function (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                _this.statements.set(nodes[i].id, { isAdmit: nodes[i].isAdmit, idLogic: i });
            }
        };
        this.getAlphabetFromEdges = function (edges) {
            var alphabetSet = new Set;
            for (var i_1 = 0; i_1 < edges.length; i_1++) {
                edges[i_1].value.forEach(function (value) { return alphabetSet.add(value); });
            }
            var i = 0;
            alphabetSet.forEach(function (value) {
                _this.alphabet.set(value, i);
                i++;
            });
        };
        this.createMatrix = function (edges) {
            for (var i = 0; i < _this.statements.size; i++) {
                _this.matrix[i] = [];
                for (var j = 0; j < _this.alphabet.size; j++) {
                    _this.matrix[i][j] = exports.eof;
                }
            }
            var _loop_1 = function (i) {
                var statementNumberFrom = _this.statements.get(edges[i].from).idLogic;
                var alphabetSymbolNumber = _this.alphabet.get(edges[i].value);
                var statementNumberTo = _this.statements.get(edges[i].to);
                edges[i].value.forEach(function (value) { return _this.matrix[statementNumberFrom][_this.alphabet.get(value)] = statementNumberTo; });
            };
            for (var i = 0; i < edges.length; i++) {
                _loop_1(i);
            }
        };
        this.getTransformedInput = function (input) {
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
                //console.log(value, this.alphabet.get(value))
            });
        };
        this.getCurrentNode = function (current) {
            return _this.nodes[current.idLogic];
        };
        this.isAdmit = function () {
            var current = _this.statements.get(_this.startStatement.id);
            var oldCurrent = current;
            var l = 0;
            var i = current.idLogic;
            var j = -1; //now we see at left column of table of def statements
            if (_this.alphabet.size < 1) {
                console.log('Alphabet is empty, you should to enter edges');
                return current.isAdmit;
            }
            console.log(_this.getCurrentNode(current), 'NOW in', 'start statement');
            while (l < _this.input.length) {
                var isMoved = false;
                j = _this.input[l].idLogic;
                if (_this.matrix[i][j] === exports.eof) {
                    console.log(_this.getCurrentNode(oldCurrent), 'FUBAR Aoutomata was stoped in ', oldCurrent, 'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j);
                    return oldCurrent.isAdmit;
                }
                oldCurrent = current;
                current = _this.matrix[i][j];
                console.log(_this.getCurrentNode(current), 'NOW in', ' ~ ', i, ' ', j);
                i = _this.matrix[i][j].idLogic;
                l++;
            }
            console.log(_this.getCurrentNode(current), 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j);
            return current.isAdmit;
        };
        var edges = graph.edges.sort(function (a, b) { return a.from - b.from; });
        //console.log('EDGES: ', edges)
        this.getAlphabetFromEdges(edges);
        //console.log('ALPHABET: ', this.alphabet)
        this.getTransformedInput(input);
        this.getStatementsFromNodes(graph.nodes);
        //console.log('STATEMENTS: ', this.statements)
        this.createMatrix(edges);
        //console.log('MATRIX ', this.matrix)
        this.startStatement = startStatement;
        this.nodes = graph.nodes;
        console.log(this.nodes, this.statements);
    }
    return DFA;
}());
exports.DFA = DFA;
/*
let dfa = new DFA(
    {
        nodes: [
            {id: 0, isAdmit: true},
            {id: 44, isAdmit: false},
        ],
    edges: [


]
}, {id: 0, isAdmit: true}, ['0', 'a'])
dfa.isAdmit()*/ 
