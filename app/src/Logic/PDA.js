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
exports.ImSet = exports.PDA = void 0;
var Computer_1 = require("./Computer");
var Stack_1 = require("./Stack");
var lodash_1 = require("lodash");
var PDA = /** @class */ (function (_super) {
    __extends(PDA, _super);
    function PDA(graph, startStatements, input, byEmpty) {
        var _this = _super.call(this, graph, startStatements) || this;
        _this.stack = new Stack_1.Stack();
        _this.setInput = function (input) {
            _this.input = [];
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
            });
            _this.restart();
        };
        _this.haveEpsilon = function () {
            return _this.epsId !== undefined;
        };
        _this.getStartStatements = function () {
            var curs = _this.curPosition.map(function (v) {
                var _a;
                var stmt = v.stmt;
                stmt.stack = (_a = v.stack) === null || _a === void 0 ? void 0 : _a.getStorage();
                return stmt;
            });
            return curs;
        };
        _this.byEmptyStackAdmt = function (isAdmt) {
            _this.admitByEmptyStack = isAdmt;
        };
        _this.treeHist = [];
        _this.pdaStep = function () {
            var _a;
            var histUnit = [];
            var ret = _this._step(_this.counterSteps, _this.alphabet.get((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value), _this.historiStep, histUnit, []);
            _this.counterSteps = ret.counter;
            _this.historiStep = ret.history;
            _this.treeHist = ret.tree ? ret.tree : [];
            return ret;
        };
        _this.pdaRun = function () {
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            var histUnit = [];
            var histTrace = [];
            for (var i = 0; i < _this.input.length - 1; i++) {
                var tmp = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun, histUnit, []);
                _this.counterStepsForResult = tmp.counter;
                _this.historiRun = tmp.history;
                histTrace.push({ byEpsPred: tmp.byEpsPred, byLetter: tmp.byLetter, byEpsAfter: tmp.byEpsAfter });
            }
            var last = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun, histUnit, []);
            histTrace.push({ byEpsPred: last.byEpsPred, byLetter: last.byLetter, byEpsAfter: last.byEpsAfter });
            var ret = {
                nodes: last.nodes,
                counter: last.counter,
                isAdmit: last.isAdmit,
                history: last.history,
                histTrace: histTrace
            };
            console.log('ret.histTrace');
            console.log(ret.histTrace);
            console.log('ret.histTrace');
            return ret;
        };
        _this.step = _this.pdaStep;
        _this.run = _this.pdaRun;
        _this._step = function (counter, tr, histori, unitHsit, histTrace) {
            var byEpsPred = [];
            var byEpsAfter = [];
            var byLetter = [];
            var newPosSet = [];
            var updCurPos = function () {
                _this.curPosition = [];
                newPosSet.forEach(function (value) { return _this.curPosition.push(value); });
                newPosSet = [];
            };
            var epsStep = function () {
                _this.curPosition.forEach(function (value) {
                    var _a;
                    var pPos = _this.epsilonStep(value.stmt.idLogic, (_a = value.stack) === null || _a === void 0 ? void 0 : _a.peek(), value.stack, unitHsit);
                    pPos === null || pPos === void 0 ? void 0 : pPos.forEach(function (value1) { return newPosSet.push(value1); });
                });
            };
            var letterSter = function () {
                _this.curPosition.forEach(function (value) {
                    var pPos = _this.letterStep(tr, value.stmt.idLogic, value.stack.peek(), value.stack, unitHsit);
                    pPos.forEach(function (value1) { return newPosSet.push(value1); });
                });
            };
            var rmRepeations = function () {
                var htable = new Map();
                var positions = [];
                _this.curPosition.forEach(function (value) {
                    var v = {
                        stmt: value.stmt, stack: value.stack
                    };
                    if (htable.get(JSON.stringify(v)) === undefined) {
                        positions.push(value);
                        htable.set(JSON.stringify(v), value);
                    }
                });
                _this.curPosition = [];
                positions.forEach(function (value) { return _this.curPosition.push(value); });
            };
            if (_this.epsId !== undefined) {
                epsStep();
                updCurPos();
                rmRepeations();
                _this.toNodes(_this.curPosition).forEach(function (v) { return byEpsPred.push(v); });
            }
            if (counter < _this.input.length) {
                letterSter();
                updCurPos();
                rmRepeations();
                _this.toNodes(_this.curPosition).forEach(function (v) { return byLetter.push(v); });
                if (_this.epsId !== undefined) {
                    epsStep();
                    updCurPos();
                    rmRepeations();
                    _this.toNodes(_this.curPosition).forEach(function (v) { return byEpsAfter.push(v); });
                }
            }
            else {
                rmRepeations();
                _this.treeHist.push(unitHsit);
                histTrace.push({ byEpsPred: byEpsPred, byEpsAfter: byEpsAfter, byLetter: byLetter });
                return {
                    nodes: _this.toNodes(_this.curPosition),
                    counter: counter,
                    isAdmit: _this.haveAdmitting(_this.curPosition),
                    history: histori,
                    tree: _this.treeHist,
                    byEpsPred: byEpsPred,
                    byEpsAfter: byEpsAfter,
                    byLetter: byLetter,
                    histTrace: []
                };
            }
            rmRepeations();
            histori.push({ nodes: _this.toNodes(_this.curPosition), by: _this.input[counter].value });
            counter++;
            _this.treeHist.push(unitHsit);
            histTrace.push({ byEpsPred: byEpsPred, byEpsAfter: byEpsAfter, byLetter: byLetter });
            return {
                nodes: _this.toNodes(_this.curPosition),
                counter: counter,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                history: histori,
                tree: _this.treeHist,
                byEpsPred: byEpsPred,
                byEpsAfter: byEpsAfter,
                byLetter: byLetter,
                histTrace: []
            };
        };
        _this.restart = function () {
            _this.counterSteps = 0;
            _this.historiStep = [];
            _this.curPosition = [];
            _this.treeHist = [];
            _this.startStatements.forEach(function (value) {
                var stack = new Stack_1.Stack();
                stack.push(Computer_1.BOTTOM);
                _this.curPosition.push({
                    stmt: _this.statements.get(value.id),
                    stack: stack
                });
            });
        };
        _this.admitByEmptyStack = byEmpty;
        _this.epsId = _this.alphabet.get(Computer_1.EPS);
        _this.stack.push(Computer_1.BOTTOM);
        _this.curPosition = [];
        _this.treeHist = [];
        startStatements.forEach(function (value) {
            var stack = new Stack_1.Stack();
            stack.push(Computer_1.BOTTOM);
            _this.curPosition.push({
                stmt: _this.statements.get(value.id),
                stack: stack
            });
        });
        _this.setInput(input);
        if (_this.epsId) {
            _this.curPosition.forEach(function (value) {
                _this.cycleEps(value.stmt.idLogic, value.stack);
            });
        }
        return _this;
    }
    PDA.prototype.copyPushList = function (value) {
        var _a;
        var cpy = [];
        (_a = value.stackPush) === null || _a === void 0 ? void 0 : _a.forEach(function (value) { return cpy.push(value); });
        return cpy;
    };
    PDA.prototype.pushReverse = function (pushVals, stack) {
        pushVals.reverse().forEach(function (value) {
            stack.push(value);
        });
    };
    PDA.prototype.pushTopToNewStack0 = function (newStack, value) {
        newStack.pop();
        var pushVals = this.copyPushList(value);
        this.pushReverse(pushVals, newStack);
    };
    PDA.permute0 = function (permutation) {
        var r = (0, lodash_1.cloneDeep)(permutation);
        function cmp(a, b) {
            if (a.stackDown && b.stackDown) {
                if (a.stackDown < b.stackDown) {
                    return -1;
                }
                if (a.stackDown > b.stackDown) {
                    return 1;
                }
                return 0;
            }
            return 0;
        }
        r = r.sort(cmp);
        var tmp = [];
        var _tmp = [];
        var dwn = r[0].stackDown;
        for (var i = 0; i < r.length; i++) {
            if (r[i].stackDown === dwn) {
                _tmp.push(r[i]);
            }
            else {
                tmp.push(_tmp);
                dwn = r[i].stackDown;
                _tmp = [];
                _tmp.push(r[i]);
            }
        }
        tmp.push(_tmp);
        var ret = [];
        var _detour = function (lvl, cur, acc) {
            if (lvl < tmp.length) {
                for (var i = 0; i < tmp[lvl].length; i++) {
                    var a = (0, lodash_1.cloneDeep)(acc);
                    a.push(tmp[lvl][i]);
                    _detour(lvl + 1, i, a);
                }
            }
            else {
                ret.push(acc);
            }
        };
        _detour(0, 0, []);
        return ret;
    };
    PDA.permute = function (permutation) {
        var length = permutation.length;
        var result = [permutation.slice()];
        var c = new Array(length).fill(0);
        var i = 1;
        var k;
        var p;
        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i];
                permutation[i] = permutation[k];
                permutation[k] = p;
                c[i]++;
                i = 1;
                result.push(permutation.slice());
            }
            else {
                c[i] = 0;
                i++;
            }
        }
        return result;
    };
    PDA.prototype.rmRepetitions = function (htable, value, positions, idLogic, newStack) {
        var wasCreated = function (hash) {
            return htable.get(hash) !== undefined;
        };
        if (!wasCreated(JSON.stringify(value))) {
            positions.push({ stmt: this.statements.get(idLogic), stack: newStack });
            htable.set(JSON.stringify({ stmt: this.statements.get(idLogic), stack: newStack }), { stmt: this.statements.get(idLogic), stack: newStack });
        }
    };
    PDA.prototype.cycleEps = function (curLId, stack0) {
        var _this = this;
        var htable = new Map();
        var positions = [];
        var visited = [];
        this.cellMatrix(curLId, this.epsId).forEach(function () { return visited.push(false); });
        var permutes = this.cellMatrix(curLId, this.epsId)[0] !== undefined
            ? PDA.permute0(this.cellMatrix(curLId, this.epsId))
            : [(this.cellMatrix(curLId, this.epsId))];
        var cycle = function (cell, idx, idLogic, stack) {
            visited[idx] = true;
            cell.forEach(function (value, index) {
                if (value.idLogic === idLogic) {
                    if (value.stackDown === stack.peek()) {
                        var newCycleStack = stack.cpyTo(new Stack_1.Stack());
                        _this.matchPushEpsVal(value, newCycleStack);
                        _this.rmRepetitions(htable, { stmt: _this.statements.get(idLogic), stack: newCycleStack }, positions, idLogic, newCycleStack);
                        if (!visited[index]) {
                            cycle(cell, index, idLogic, newCycleStack);
                        }
                    }
                    else if (value.stackDown === Computer_1.EPS) {
                        var newCycleStack = stack.cpyTo(new Stack_1.Stack());
                        _this.matchDownEpsVal(value, newCycleStack);
                        _this.rmRepetitions(htable, { stmt: _this.statements.get(idLogic), stack: newCycleStack }, positions, idLogic, newCycleStack);
                        if (!visited[index]) {
                            cycle(cell, index, idLogic, newCycleStack);
                        }
                    }
                }
            });
        };
        permutes.forEach(function (value) {
            for (var i = 0; i < visited.length; i++) {
                visited[i] = false;
            }
            cycle(value, 0, curLId, stack0);
        });
        return positions;
    };
    PDA.prototype.epsilonStep = function (curLId, stackDown, stack, hist) {
        var _this = this;
        if (this.epsId === undefined) {
            return;
        }
        var visited = [];
        for (var i = 0; i < this.statements.size; i++) {
            visited.push(false);
        }
        var dfs = function (id, stack, stDwn, elements) {
            _this.cycleEps(id, stack).forEach(function (value) {
                elements.push({
                    idLogic: id,
                    top: value.stack
                });
            });
            elements.push({
                idLogic: id,
                top: stack
            });
            visited[id] = true;
            for (var i = 0; i < _this.matrix[id][_this.epsId].length; i++) {
                if (!visited[_this.cellMatrix(id, _this.epsId)[i].idLogic]) {
                    switch (_this.cellMatrix(id, _this.epsId)[i].stackDown) {
                        case stDwn: {
                            var newStack = stack.cpyTo(new Stack_1.Stack());
                            _this.matchPushEpsVal(_this.cellMatrix(id, _this.epsId)[i], newStack);
                            dfs(_this.cellMatrix(id, _this.epsId)[i].idLogic, newStack, newStack.peek(), elements);
                            break;
                        }
                        case Computer_1.EPS: {
                            var newStack = stack.cpyTo(new Stack_1.Stack());
                            _this.matchDownEpsVal(_this.cellMatrix(id, _this.epsId)[i], newStack);
                            dfs(_this.cellMatrix(id, _this.epsId)[i].idLogic, newStack, newStack.peek(), elements);
                            break;
                        }
                    }
                }
            }
            return elements;
        };
        var histUnit = [];
        var endsOfEpsWay = dfs(curLId, stack, stackDown, []);
        var positions = [];
        for (var i = 0; i < endsOfEpsWay.length; i++) {
            var stmt = this.statements.get(this.nodes[endsOfEpsWay[i].idLogic].id);
            positions.push({
                stmt: stmt, stack: endsOfEpsWay[i].top,
                from: this.nodes[curLId],
                cur: this.nodes[stmt.idLogic],
                by: Computer_1.EPS,
                oldStack: stack,
                stackDown: stackDown
            });
            hist.push({ by: Computer_1.EPS, from: this.nodes[curLId], value: this.nodes[stmt.idLogic] });
        }
        return positions;
    };
    PDA.prototype.matchPushEpsVal = function (value, newStack) {
        if (value.stackPush[0] === Computer_1.EPS) {
            if (value.stackPush.length !== 1) {
                throw Error("pushing list should be consist by [EPS] for 'pop'");
            }
            else {
                newStack.pop();
            }
        }
        else {
            this.pushTopToNewStack0(newStack, value);
        }
    };
    PDA.prototype.matchDownEpsVal = function (value, newStack) {
        if (value.stackPush[0] === Computer_1.EPS && value.stackPush.length !== 1) {
            throw Error("pushing list should be consist by [EPS] for 'pop'");
        }
        else if (value.stackPush[0] !== Computer_1.EPS) {
            var pushVals = this.copyPushList(value);
            this.pushReverse(pushVals, newStack);
        }
    };
    PDA.prototype.letterStep = function (transformedInput, curLId, stackDown, stack, hist) {
        var _this = this;
        var positions = [];
        var histUnit = [];
        var getLetter = function (id) {
            var ret;
            _this.alphabet.forEach(function (v, k) {
                if (id === v) {
                    ret = k;
                }
            });
            return ret;
        };
        this.cellMatrix(curLId, transformedInput).forEach(function (value) {
            switch (value.stackDown) {
                case stackDown: {
                    var newStack = stack.cpyTo(new Stack_1.Stack());
                    _this.matchPushEpsVal(value, newStack);
                    positions.push({
                        stmt: _this.statements.get(value.id),
                        stack: newStack,
                        from: _this.nodes[curLId],
                        cur: _this.nodes[value.idLogic],
                        by: getLetter(transformedInput),
                        oldStack: stack,
                        stackDown: stackDown
                    });
                    hist.push({ by: getLetter(transformedInput), from: _this.nodes[curLId], value: _this.nodes[value.idLogic] });
                    break;
                }
                case Computer_1.EPS: {
                    var newStack = stack.cpyTo(new Stack_1.Stack());
                    _this.matchDownEpsVal(value, newStack);
                    positions.push({
                        stmt: _this.statements.get(value.id),
                        stack: newStack,
                        from: _this.nodes[curLId],
                        cur: _this.nodes[value.idLogic],
                        by: getLetter(transformedInput),
                        oldStack: stack,
                        stackDown: Computer_1.EPS
                    });
                    hist.push({ by: getLetter(transformedInput), from: _this.nodes[curLId], value: _this.nodes[value.idLogic] });
                    break;
                }
            }
        });
        return positions;
    };
    PDA.prototype.isDeterministic = function () {
        var ret = true;
        this.matrix.forEach(function (line) { return line.forEach(function (cells) {
            var fstCell = cells[0];
            var hasDublicates = cells.reduce(function (acc, stmt) { return acc || (stmt.stackDown === fstCell.stackDown); }, false);
            if (cells.length > 1 && hasDublicates) {
                ret = false;
            }
        }); });
        return ret && (!this.haveEpsilon());
    };
    PDA.prototype.haveAdmitting = function (positions) {
        var ret = false;
        if (this.admitByEmptyStack === false || this.admitByEmptyStack === undefined) {
            positions.forEach(function (value) {
                if (value.stmt.isAdmit) {
                    ret = true;
                }
            });
            return ret;
        }
        else {
            positions.forEach(function (value) {
                if (value.stack.size() === 0) {
                    ret = true;
                }
            });
            return ret;
        }
    };
    PDA.prototype.toNodes = function (positions) {
        var _this = this;
        var retNodes = [];
        positions.forEach(function (value) {
            var _a, _b;
            var from = {
                id: value.from.id,
                isAdmit: value.from.isAdmit,
                stack: value.oldStack ? value.oldStack.getStorage() : undefined,
                move: (_a = value.from) === null || _a === void 0 ? void 0 : _a.move,
                output: (_b = value.from) === null || _b === void 0 ? void 0 : _b.output
            };
            var temp = __assign(__assign({}, _this.nodes[value.stmt.idLogic]), { stack: value.stack.getStorage(), from: from, cur: value.cur, by: value.by, oldStack: value.oldStack.getStorage(), stackDown: value.stackDown });
            retNodes.push(temp);
        });
        return retNodes;
    };
    return PDA;
}(Computer_1.Computer));
exports.PDA = PDA;
var Queue = /** @class */ (function () {
    function Queue(capacity) {
        if (capacity === void 0) { capacity = Infinity; }
        this.capacity = capacity;
        this.storage = [];
    }
    Queue.prototype.enqueue = function (item) {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    };
    Queue.prototype.dequeue = function () {
        return this.storage.shift();
    };
    Queue.prototype.size = function () {
        return this.storage.length;
    };
    Queue.prototype.getStorage = function () {
        return this.storage;
    };
    return Queue;
}());
var ImSet = /** @class */ (function () {
    function ImSet() {
        this.table = new Map();
        this.set = [];
    }
    ImSet.prototype.normalize = function (v) {
        var _v = (0, lodash_1.cloneDeep)(v);
        _v = _v.sort();
        return _v;
    };
    ImSet.prototype.getItter = function (value) {
        if (!this.has(value)) {
            throw Error;
        }
        var it = 0;
        var _v = this.normalize(value);
        this.set.forEach(function (value1, index) {
            if (JSON.stringify(_v) === JSON.stringify(value1)) {
                it = index;
            }
        });
        return it;
    };
    ImSet.prototype.has = function (value) {
        var _v = this.normalize(value);
        var k = JSON.stringify(_v);
        return this.table.has(k);
    };
    ImSet.prototype.myForEach = function (callback) {
        this.set.forEach(function (value1, index) {
            callback(value1, index);
        });
    };
    ImSet.prototype.add = function (value) {
        var _v = this.normalize(value);
        var k = JSON.stringify(_v);
        if (!this.table.has(k)) {
            this.table.set(k, _v);
            this.set.push(_v);
        }
    };
    ImSet.prototype.size = function () {
        return this.set.length;
    };
    ImSet.prototype.getNth = function (i) {
        return this.set[i];
    };
    ImSet.prototype.getIter = function (value) {
        var _v = this.normalize(value);
        var k = JSON.stringify(_v);
        var iter = 0;
        this.set.forEach(function (v, index) {
            if (JSON.stringify(v) === k) {
                iter = index;
            }
        });
        return iter;
    };
    ImSet.prototype.getStorage = function () {
        return this.set;
    };
    return ImSet;
}());
exports.ImSet = ImSet;
