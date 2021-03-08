"use strict";
exports.__esModule = true;
exports.DFA = exports.eof = void 0;
exports.eof = { id: -1, isAdmit: false };
var DFA = /** @class */ (function () {
    function DFA(statements, matrix, input, alphabet) {
        var _this = this;
        this.firstMatchValue = function (current) {
            var i = 0;
            while (current !== _this.alphabet[i]) {
                i++;
            }
            return i;
        };
        this.firstMatchStatement = function (current) {
            var i = 0;
            while (current !== _this.statements[i]) {
                i++;
            }
            return i;
        };
        this.isAdmit = function () {
            var current = _this.startStatemetn; // START STATEMENT
            var oldCurrent = current;
            var l = 0;
            var i = 0;
            var j = -1; //now we see at left column of table of def statements
            console.log('NOW in', current, 'start statement');
            while (l < _this.input.length) {
                j = _this.firstMatchValue(_this.input[l]);
                if (_this.matrix[i][j] === exports.eof) {
                    console.log('FUBAR Aoutomata was stoped in ', oldCurrent, 'because string has only EOF values (noway from this statement)', ' in: ', i, ' ', j);
                    return oldCurrent.isAdmit;
                }
                oldCurrent = current;
                current = _this.matrix[i][j];
                console.log('NOW in', current, ' ~ ', i, ' ', j);
                i = _this.firstMatchStatement(_this.matrix[i][j]);
                l++;
            }
            console.log('Aoutomata was stoped in ', current, ' ~ ', i, ' ', j);
            return current.isAdmit;
        };
        this.statements = statements;
        this.input = input;
        this.matrix = matrix;
        this.alphabet = alphabet;
        this.startStatemetn = statements[0];
    }
    return DFA;
}());
exports.DFA = DFA;
var q0 = { id: 0, isAdmit: false };
var q1 = { id: 1, isAdmit: false };
var q2 = { id: 2, isAdmit: true };
var matrix = [
    [exports.eof]
];
var dfa = new DFA([q0, q1, q2], matrix, [0, 1, 1, 1, 1], [0]);
console.log(dfa.isAdmit());
