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
var Exceptions_1 = require("./Exceptions");
var Moore_1 = require("./Moore");
var DMoore = /** @class */ (function (_super) {
    __extends(DMoore, _super);
    function DMoore(graph, startStatements, input) {
        var _this = _super.call(this, graph, startStatements, input) || this;
        _this.step = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1["default"]();
            }
            return _this.oaRun();
        };
        _this.run = function () {
            if (!_super.prototype.isDeterministic.call(_this)) {
                throw new Exceptions_1["default"]();
            }
            return _this.oaRun();
        };
        return _this;
    }
    return DMoore;
}(Moore_1.Moore));
exports.DMoore = DMoore;
