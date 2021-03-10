"use strict";
exports.__esModule = true;
exports.DFA = exports.eof = void 0;
exports.eof = { isAdmit: false, idLogic: -1 };
var DFA = /** @class */ (function () {
    function DFA(startStatement, graph, input /*statements: statement[], matrix: statement[][], input: elementOfAlphabet[] , alphabet: elementOfAlphabet[]*/) {
        //this.statements = statements
        //this.input = input
        //this.matrix = matrix
        //this.alphabet = alphabet
        //this.startStatement = statements[0]
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
                alphabetSet.add(edges[i_1].value);
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
            for (var i = 0; i < edges.length; i++) {
                var statementNumberFrom = _this.statements.get(edges[i].from).idLogic;
                var alphabetSymbolNumber = _this.alphabet.get(edges[i].value);
                var statementNumberTo = _this.statements.get(edges[i].to);
                _this.matrix[statementNumberFrom][alphabetSymbolNumber] = statementNumberTo;
                //console.log(this.statements.get(edges[i].from).idLogic, this.alphabet.get(edges[i].value), '<->', edges[i].value, this.statements.get(edges[i].to))
            }
        };
        this.getTransformedInput = function (input) {
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
                console.log(value, _this.alphabet.get(value));
            });
        };
        this.isAdmit = function () {
            var current = _this.statements.get(_this.startStatement.id);
            var oldCurrent = current;
            var l = 0;
            var i = current.idLogic;
            var j = -1; //now we see at left column of table of def statements
            console.log('NOW in', current, 'start statement');
            while (l < _this.input.length) {
                j = _this.input[l].idLogic;
                if (_this.matrix[i][j] === exports.eof) {
                    console.log('FUBAR Aoutomata was stoped in ', oldCurrent, 'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j);
                    return oldCurrent.isAdmit;
                }
                oldCurrent = current;
                current = _this.matrix[i][j];
                console.log('NOW in', current, ' ~ ', i, ' ', j);
                i = _this.matrix[i][j].idLogic;
                l++;
            }
            console.log('Aoutomata was stoped in ', current, ' ~ ', i, ' ', j);
            return current.isAdmit;
        };
        var edges = graph.edges.sort(function (a, b) { return a.from - b.from; });
        //console.log(edges)
        this.getAlphabetFromEdges(edges);
        //console.log(this.alphabet)
        this.getStatementsFromNodes(graph.nodes);
        //console.log(this.statements)
        this.createMatrix(edges);
        //console.log(this.matrix)
        this.startStatement = startStatement;
        this.getTransformedInput(input);
    }
    return DFA;
}());
exports.DFA = DFA;
var q0 = { id: 0, isAdmit: true, idLogic: 0 };
var q1 = { id: 1, isAdmit: false, idLogic: 1 };
var matrix = [
    [q1, q1],
    [q0, q0]
];
//let dfa = new DFA([q0, q1] ,matrix, [{idLogic: 0, value: '0'},  {idLogic: 1, value: '0'}], [{idLogic: 0, value: '0'}, {idLogic: 1, value: '1'}])
var dfa = new DFA({ id: 0, isAdmit: true }, {
    nodes: [
        { id: 0, isAdmit: true },
        { id: 44, isAdmit: false },
        { id: 88, isAdmit: false }
    ],
    edges: [
        { from: 0, to: 44, value: '0' },
        { from: 44, to: 88, value: '0' },
        { from: 88, to: 88, value: 'a' }
    ]
}, ['0', '0', 'a']);
dfa.isAdmit();
