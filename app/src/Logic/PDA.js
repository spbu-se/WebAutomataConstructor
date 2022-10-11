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
var Exceptions_1 = require("./Exceptions");
var PDA = /** @class */ (function (_super) {
    __extends(PDA, _super);
    // isDeterministic0(): boolean {
    //     let ret = true
    //     this.matrix.forEach(value => {
    //         value.forEach(value1 => {
    //             if (value1.length > 1) {
    //                 let tmp: statementCell = value1[0]
    //                 value1.forEach((value2, index) => {
    //                     if (index !== 0 && tmp.stackDown === undefined && value2.stackDown || index !== 0 && tmp.stackDown === value2.stackDown ) {
    //                         ret = false
    //                     }
    //                 })
    //             }
    //         })
    //     })
    //     return ret && (!this.haveEpsilon())
    // }
    function PDA(graph, startStatements, input, byEmpty) {
        var _this = _super.call(this, graph, startStatements) || this;
        // protected matrix: statementCells[][] = []
        _this.stack = new Stack_1.Stack();
        _this.setInput = function (input) {
            _this.input = [];
            input.forEach(function (value) {
                _this.input.push({ idLogic: _this.alphabet.get(value), value: value });
            });
            _this.restart();
        };
        _this.byEmptyStackAdmt = function (isAdmt) {
            _this.admitByEmptyStack = isAdmt;
        };
        _this.pdaStep = function () {
            var _a;
            var ret = _this._step(_this.counterSteps, _this.alphabet.get((_a = _this.input[_this.counterSteps]) === null || _a === void 0 ? void 0 : _a.value), _this.historiStep);
            _this.counterSteps = ret.counter;
            _this.historiStep = ret.history;
            console.log("STEP stck: ");
            ret.history.forEach(function (value) { return value.nodes.forEach(function (value1) { return console.log(value1.stack); }); });
            console.log("STEP admit: ");
            console.log(ret.isAdmit);
            return ret;
        };
        _this.pdaRun = function () {
            _this.historiRun = [];
            _this.counterStepsForResult = 0;
            for (var i = 0; i < _this.input.length - 1; i++) {
                var tmp = _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun);
                _this.counterStepsForResult = tmp.counter;
                _this.historiRun = tmp.history;
            }
            return _this._step(_this.counterStepsForResult, _this.alphabet.get(_this.input[_this.counterStepsForResult].value), _this.historiRun);
        };
        _this.step = _this.pdaStep;
        _this.run = _this.pdaRun;
        _this._step = function (counter, tr, histori) {
            var newPosSet = [];
            var updCurPos = function () {
                _this.curPosition = [];
                newPosSet.forEach(function (value) { return _this.curPosition.push(value); });
                newPosSet = [];
            };
            var epsStep = function () {
                _this.curPosition.forEach(function (value) {
                    var _a;
                    var pPos = _this.epsilonStep(value.stmt.idLogic, (_a = value.stack) === null || _a === void 0 ? void 0 : _a.peek(), value.stack);
                    pPos === null || pPos === void 0 ? void 0 : pPos.forEach(function (value1) { return newPosSet.push(value1); });
                });
            };
            var letterSter = function () {
                _this.curPosition.forEach(function (value) {
                    var pPos = _this.letterStep(tr, value.stmt.idLogic, value.stack.peek(), value.stack);
                    pPos.forEach(function (value1) { return newPosSet.push(value1); });
                });
            };
            var rmRepeations = function () {
                var htable = new Map();
                var positions = [];
                _this.curPosition.forEach(function (value) {
                    if (htable.get(JSON.stringify(value)) === undefined) {
                        positions.push(value);
                        htable.set(JSON.stringify(value), value);
                    }
                });
                _this.curPosition = [];
                positions.forEach(function (value) { return _this.curPosition.push(value); });
            };
            if (_this.epsId !== undefined) {
                epsStep();
                updCurPos();
            }
            if (counter < _this.input.length) {
                letterSter();
                updCurPos();
                if (_this.epsId !== undefined) {
                    epsStep();
                    updCurPos();
                }
            }
            else {
                rmRepeations();
                // console.log(":::::::::::::::::::")
                // this.curPosition.forEach(value => {
                //     console.log(value.stmt)
                //     console.log(value.stack)
                // })
                // console.log(":::::::::::::::::::")
                return {
                    nodes: _this.toNodes(_this.curPosition),
                    counter: counter,
                    isAdmit: _this.haveAdmitting(_this.curPosition),
                    history: histori
                };
            }
            rmRepeations();
            // console.log(":::::::::::::::::::")
            // this.curPosition.forEach(value => {
            //     console.log(value.stmt)
            //     console.log(value.stack)
            // })
            // console.log(":::::::::::::::::::")
            histori.push({ nodes: _this.toNodes(_this.curPosition), by: _this.input[counter].value });
            counter++;
            return {
                nodes: _this.toNodes(_this.curPosition),
                counter: counter,
                isAdmit: _this.haveAdmitting(_this.curPosition),
                history: histori
            };
        };
        _this.restart = function () {
            _this.counterSteps = 0;
            _this.historiStep = [];
            _this.curPosition = [];
            _this.startStatements.forEach(function (value) {
                var stack = new Stack_1.Stack();
                stack.push(Computer_1.BOTTOM);
                _this.curPosition.push({
                    stmt: _this.statements.get(value.id),
                    stack: stack
                });
            });
        };
        // move to Nfa
        _this.nfaToDfa = function () {
            var nextStepPosition = function (position, by) {
                return _this.cellMatrix(position.stmt.idLogic, by).map(function (v) { return ({ stmt: v }); });
            };
            var _nextStepPositions = function (positions, by) {
                var acc = [];
                positions.map(function (v) {
                    return nextStepPosition(v, by);
                }).forEach(function (ps) {
                    return ps.forEach(function (p) { return acc.push(p); });
                });
                return acc;
            };
            var nextStepPositions = function (positions, by) {
                var afterEps = function (positions) {
                    if (_this.epsId === undefined) {
                        return positions;
                    }
                    var acc = [];
                    var EPStack = new Stack_1.Stack();
                    EPStack.push(Computer_1.EPS);
                    positions.forEach(function (position) {
                        var tmp = _this.epsilonStep(position.stmt.idLogic, Computer_1.EPS, EPStack);
                        if (tmp !== undefined) {
                            acc.push(tmp);
                        }
                    });
                    var flatted = [];
                    acc.forEach(function (ps) { return ps.forEach(function (p) { return flatted.push(p); }); });
                    return flatted;
                };
                return afterEps(_nextStepPositions(afterEps(positions), by));
            };
            var pop = function () { return stack.shift(); };
            var push = function (v) {
                stack.push(v);
            };
            var stack = [];
            var table = [];
            var set = new ImSet();
            var startPos = _this.curPosition;
            _this.restart();
            push(startPos);
            var _loop_1 = function () {
                var head = pop();
                var acc = [];
                if (head === undefined || head.length === 0) {
                    return "break";
                }
                if (set.has(head)) {
                    return "continue";
                }
                set.add(head.map(function (v) { return ({
                    stmt: {
                        id: v.stmt.id,
                        idLogic: v.stmt.idLogic,
                        isAdmit: v.stmt.isAdmit
                    },
                    stack: undefined
                }); }));
                _this.alphabet.forEach(function (value) {
                    if (value !== _this.epsId) {
                        var to = nextStepPositions(head, value);
                        var _to = to.map(function (v) { return ({
                            stmt: {
                                id: v.stmt.id,
                                idLogic: v.stmt.idLogic,
                                isAdmit: v.stmt.isAdmit
                            },
                            stack: undefined
                        }); });
                        acc.push(_to);
                        if (to.length > 0 && !set.has(to) && !set.has(_to)) {
                            push(_to);
                        }
                    }
                });
                table.push(acc);
            };
            while (stack.length > 0) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
            var _edges = [];
            table.forEach(function (ps, from) {
                _this.alphabet.forEach(function (tr, letter) {
                    if (tr !== _this.epsId && ps[tr].length !== 0) {
                        console.log(ps[tr]);
                        console.log(from, set.getIter(ps[tr]));
                        _edges.push({
                            from: from,
                            to: set.getIter(ps[tr]),
                            transitions: new Set([[{ title: letter }]])
                        });
                    }
                });
            });
            var nodes = set.getStorage().map(function (v) { return ({
                id: set.getIter(v),
                isAdmit: _this.haveAdmitting(v)
            }); });
            var edges = [];
            _edges.sort(function (a, b) { return a.from - b.from || a.to - b.to; });
            for (var i = 0; i < _edges.length; i++) {
                var acc = [];
                var delta = 0;
                for (var j = i; j < _edges.length; j++) {
                    if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                        acc.push(Array.from(_edges[j].transitions)[0][0]);
                        delta++;
                    }
                }
                edges.push({
                    from: _edges[i].from,
                    to: _edges[i].to,
                    transitions: new Set([acc])
                });
                i += delta - 1;
            }
            return { nodes: nodes, edges: edges };
        };
        //https://www.usna.edu/Users/cs/wcbrown/courses/F17SI340/lec/l22/lec.html
        _this.minimizeDfa = function () {
            _this.restart();
            var startId = _this.curPosition[0].stmt.idLogic;
            var cutBy = function (by) {
                var acc = [];
                _this.matrix.forEach(function (_, it) { return acc.push(_this.cellMatrix(it, by)[0]); });
                return acc;
            };
            var _lookUp = function (group) { return function (id) {
                return group[id];
            }; };
            var _getJump = function (table) { return function (by) { return function (id) {
                return table[by][id];
            }; }; };
            var createTableT = function (zero) {
                var lookUp = _lookUp(zero);
                var table = [];
                _this.alphabet.forEach(function (tr) {
                    var acc = [];
                    var cutted = cutBy(tr);
                    cutted.forEach(function (cell) {
                        acc.push(lookUp(cell.idLogic));
                    });
                    table.push(acc);
                });
                return table;
            };
            var _updateGroups = function (zero) { return function (groups) { return function (getJump) { return function (group) {
                var jmpGrp = getJump(group[0].node.idLogic).number;
                var newGrp = [];
                var newNumber = groups.length + 1;
                var toRm = [];
                group.forEach(function (value, index) {
                    if (getJump(value.node.idLogic).number !== jmpGrp) {
                        value.number = newNumber;
                        toRm.push(value.node.idLogic);
                        newGrp.push(value);
                    }
                });
                for (var i = 0; i < group.length; i++) {
                    if (toRm.includes(group[i].node.idLogic)) {
                        group.splice(i, 1);
                        i--;
                    }
                }
                if (newGrp.length > 0) {
                    groups.push(newGrp);
                    return { fst: group, snd: newGrp };
                }
                return { fst: [], snd: [] };
            }; }; }; };
            var stack = [];
            var pop = function () { return stack.shift(); };
            var push = function (v) { return stack.push(v); };
            var zero = [];
            var first = [];
            var second = [];
            _this.statements.forEach(function (statement) {
                var element = { number: -1, node: { idLogic: -1, id: -1, isAdmit: false } };
                if (statement.isAdmit) {
                    element = { number: 1, node: statement };
                    first.push(element);
                }
                else {
                    element = { number: 2, node: statement };
                    second.push(element);
                }
                zero.push(element);
            });
            var byEveryLetter = _this.matrix.reduce(function (acc, line) {
                return acc && line.reduce(function (accLine, cells) { return accLine && cells.length > 0; }, acc);
            }, true);
            if (first.length < 1 || !byEveryLetter) {
                console.log('CATHTHT');
                throw new Exceptions_1.NonMinimizable();
            }
            // плюс если есть пробелы в таблице!
            var groups = [];
            groups.push(first);
            groups.push(second);
            var table = createTableT(zero);
            _this.alphabet.forEach(function (tr) {
                groups.forEach(function (stmt) { return push(stmt); });
                var getJump = _getJump(table)(tr);
                var updateGroups = _updateGroups(zero)(groups)(getJump);
                while (stack.length > 0) {
                    var head = pop();
                    if (head === undefined) {
                        break;
                    }
                    var newGrp = updateGroups(head);
                    if (newGrp.fst.length > 0) {
                        push(newGrp.fst);
                        push(newGrp.snd);
                    }
                }
            });
            var toPositions = function (group) { return group.map(function (g) { return ({ stmt: g.node }); }); };
            var grpAfterJmp = function (group, by) { return _getJump(table)(by)(group[0].node.idLogic).number; };
            var nodes = groups.map(function (group) { return ({ id: group[0].number, isAdmit: _this.haveAdmitting(toPositions(group)) }); });
            var edges = groups.reduce(function (acc, g) {
                _this.alphabet.forEach(function (tr, letter) {
                    acc.push({
                        from: g[0].number,
                        to: grpAfterJmp(g, tr),
                        transitions: new Set([[{ title: letter }]])
                    });
                });
                return acc;
            }, []);
            console.log(nodes);
            var startGrp = groups.filter(function (g) {
                var gIds = g.map(function (v) { return v.node.idLogic; });
                return gIds.includes(startId);
            });
            var start = nodes[startGrp[0][0].number - 1];
            return { graphcore: { nodes: nodes, edges: edges }, start: start };
        };
        _this.admitByEmptyStack = byEmpty;
        _this.epsId = _this.alphabet.get(Computer_1.EPS);
        // this.createMatrix()
        // this.matrix.forEach(value => {
        //     value.forEach(value1 => value1.forEach(value2 => {
        //         console.log(value2.idLogic)
        //         console.log(value2.stackDown)
        //         console.log(value2.stackPush)
        //         console.log(value2.stack)
        //
        //     }))
        // })
        _this.stack.push(Computer_1.BOTTOM);
        _this.curPosition = []; //{stack: new Stack<string>(), stmt: startStatements}
        startStatements.forEach(function (value) {
            var stack = new Stack_1.Stack();
            stack.push(Computer_1.BOTTOM);
            _this.curPosition.push({
                stmt: _this.statements.get(value.id),
                stack: stack
            });
        });
        _this.setInput(input);
        if (_this.epsId) { //
            _this.curPosition.forEach(function (value) {
                _this.cycleEps(value.stmt.idLogic, value.stack);
            });
            ////// this.cycleEps(this.curPosition[0].stmt.idLogic, this.curPosition[0].stack!)
        } //
        console.log('-------------------------');
        console.log(_this.isDeterministic());
        console.log("ALPHBT");
        _this.alphabet.forEach(function (value, key) { return console.log(value, key); });
        console.log("STMTS");
        _this.statements.forEach(function (value) { return console.log(value); });
        console.log("MTX");
        _this.matrix.forEach(function (value) {
            console.log();
            value.forEach(function (value1) { return console.log(value1); });
        });
        console.log('-------------------------');
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
        var permutes = this.cellMatrix(curLId, this.epsId)[0] !== undefined ? PDA.permute0(this.cellMatrix(curLId, this.epsId)) : [(this.cellMatrix(curLId, this.epsId))];
        // permutes.push(this.cellMatrix(curLId, this.epsId))
        // let permutes: statementCell[][] = PDA.permute(this.cellMatrix(curLId, this.epsId))
        var cycle = function (cell, idx, idLogic, stack) {
            visited[idx] = true;
            cell.forEach(function (value, index) {
                if (value.idLogic === idLogic) {
                    if (value.stackDown === stack.peek()) {
                        var newCycleStack = stack.cpyTo(new Stack_1.Stack());
                        _this.matchPushEpsVal(value, newCycleStack); //
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
    PDA.prototype.epsilonStep = function (curLId, stackDown, stack) {
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
        var endsOfEpsWay = dfs(curLId, stack, stackDown, []);
        var positions = [];
        for (var i = 0; i < endsOfEpsWay.length; i++) {
            var stmt = this.statements.get(this.nodes[endsOfEpsWay[i].idLogic].id);
            positions.push({ stmt: stmt, stack: endsOfEpsWay[i].top });
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
        else if (value.stackPush[0] !== Computer_1.EPS) { //??
            var pushVals = this.copyPushList(value);
            this.pushReverse(pushVals, newStack);
        }
    };
    PDA.prototype.letterStep = function (transformedInput, curLId, stackDown, stack) {
        var _this = this;
        var positions = [];
        this.cellMatrix(curLId, transformedInput).forEach(function (value) {
            switch (value.stackDown) {
                case stackDown: {
                    var newStack = stack.cpyTo(new Stack_1.Stack());
                    _this.matchPushEpsVal(value, newStack);
                    positions.push({ stmt: _this.statements.get(value.id), stack: newStack });
                    break;
                }
                case Computer_1.EPS: {
                    var newStack = stack.cpyTo(new Stack_1.Stack());
                    _this.matchDownEpsVal(value, newStack);
                    positions.push({ stmt: _this.statements.get(value.id), stack: newStack });
                    break;
                }
            }
        });
        return positions;
    };
    PDA.prototype.haveEpsilon = function () {
        return this.epsId !== undefined;
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
            // console.log("ADMT")
            // console.log(ret)
            return ret;
        }
    };
    PDA.prototype.toNodes = function (positions) {
        var _this = this;
        var retNodes = [];
        positions.forEach(function (value) {
            var temp = __assign(__assign({}, _this.nodes[value.stmt.idLogic]), { stack: value.stack.getStorage() });
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
var nfa = new PDA({
    nodes: [
        { id: 0, isAdmit: false },
        { id: 1, isAdmit: false }
    ],
    edges: [
        { from: 0, to: 1, transitions: new Set([[{ title: '0', stackDown: 'Z0', stackPush: [Computer_1.EPS] }]]) },
        { from: 0, to: 0, transitions: new Set([[{ title: '0', stackDown: 'Z0', stackPush: [Computer_1.EPS] }]]) },
    ]
}, [{ id: 0, isAdmit: false }], ["0"]);
console.log(nfa.isDeterministic());
// nfa.step()
// let nfa = new PDA(
//     {
//         nodes: [
//             {id: 0, isAdmit: false},
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//             {id: 3, isAdmit: false},
//             {id: 4, isAdmit: true},
//             {id: 5, isAdmit: true},
//             {id: 6, isAdmit: false},
//
//         ],
//         edges: [
//
//             {from: 0, to: 1, transitions: new Set([    [{title:      '0' }]])},
//             {from: 0, to: 2, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 1, to: 3, transitions: new Set([    [{title:      '0' }]])},
//             {from: 1, to: 4, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 2, to: 3, transitions: new Set([    [{title:      '0' }]])},
//             {from: 2, to: 5, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 3, to: 3, transitions: new Set([    [{title:      '0' }, {title:      '1' }]])},
//             // {from: 3, to: 3, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 4, to: 4, transitions: new Set([    [{title:      '0' }]])},
//             {from: 4, to: 6, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 5, to: 5, transitions: new Set([    [{title:      '0' }]])},
//             {from: 5, to: 6, transitions: new Set([    [{title:      '1' }]])},
//
//             {from: 6, to: 6, transitions: new Set([    [{title:      '0' }, {title:      '1' }]])},
//             // {from: 6, to: 6, transitions: new Set([    [{title:      '1' }]])},
//
//
//         ]
//     }, [{id: 0, isAdmit: false}], ["0", "1", "0"], )
//
// nfa.nfaToDfa()
// console.log(nfa.run())
