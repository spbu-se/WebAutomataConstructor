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
exports.NFA = void 0;
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
