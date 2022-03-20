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
var PDA_1 = require("./PDA");
var Exceptions_1 = require("./Exceptions");
var DPDA = /** @class */ (function (_super) {
    __extends(DPDA, _super);
    function DPDA(graph, startStatement, input, byEmpty) {
        var _this = _super.call(this, graph, startStatement, input, byEmpty) || this;
        // step = this.pdaStep
        // run = this.pdaRun
        _this.step = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1.NonDeterministic();
            }
            return _this.pdaStep();
        };
        _this.run = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1.NonDeterministic();
            }
            return _this.pdaRun();
        };
        _this.setInput(input);
        return _this;
        // if (!super.isDeterministic()) {
        //     throw new Error("Is not determenistic")
        // }
    }
    return DPDA;
}(PDA_1.PDA));
exports.DPDA = DPDA;
