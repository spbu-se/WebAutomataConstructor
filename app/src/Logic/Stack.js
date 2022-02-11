"use strict";
exports.__esModule = true;
exports.Stack = void 0;
var Stack = /** @class */ (function () {
    function Stack(capacity) {
        if (capacity === void 0) { capacity = Infinity; }
        this.capacity = capacity;
        this.storage = [];
    }
    Stack.prototype.push = function (item) {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    };
    Stack.prototype.pop = function () {
        return this.storage.pop();
    };
    Stack.prototype.peek = function () {
        return this.storage[this.size() - 1];
    };
    Stack.prototype.size = function () {
        return this.storage.length;
    };
    Stack.prototype.getStorage = function () {
        var list = [];
        this.storage.forEach(function (value) { return list.push(value); });
        return list;
    };
    Stack.prototype.cpyTo = function (stack) {
        this.storage.forEach(function (value) { return stack.push(value); });
        return stack;
    };
    return Stack;
}());
exports.Stack = Stack;
