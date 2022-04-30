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
var NonDeterministic = /** @class */ (function (_super) {
    __extends(NonDeterministic, _super);
    function NonDeterministic() {
        var _this = _super.call(this) || this;
        _this.name = 'NonDeterministic';
        Object.setPrototypeOf(_this, NonDeterministic.prototype);
        return _this;
    }
    return NonDeterministic;
}(Error));
exports.NonDeterministic = NonDeterministic;
var NonMinimizable = /** @class */ (function (_super) {
    __extends(NonMinimizable, _super);
    function NonMinimizable() {
        var _this = _super.call(this) || this;
        _this.name = 'NonMinimizable';
        Object.setPrototypeOf(_this, NonMinimizable.prototype);
        return _this;
    }
    return NonMinimizable;
}(Error));
exports.NonMinimizable = NonMinimizable;
