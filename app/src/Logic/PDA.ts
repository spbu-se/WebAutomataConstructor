import { History, HistTrace, HistUnit, position, statement, Step } from "./Types";
import { EdgeCore, GraphCore, GraphEval, Move, NodeCore, TransitionParams } from "./IGraphTypes";
import { BOTTOM, Computer, EPS, statementCell } from "./Computer";
import { Stack } from "./Stack";
import { cloneDeep } from "lodash";
import { NonDeterministic, NonMinimizable } from "./Exceptions";

export type statementCells = Array<statementCell>

type element = {
    idLogic: number
    top: Stack<string>
}

export class PDA extends Computer {

    public epsId: any
    private stack: Stack<string> = new Stack<string>()
    public curPosition: position[]
    private admitByEmptyStack: boolean | undefined


    private copyPushList(value: statementCell): string[] {
        let cpy: string[] = []
        value.stackPush?.forEach(value => cpy.push(value))
        return cpy
    }

    private pushReverse(pushVals: string[], stack: Stack<string>) {
        pushVals.reverse().forEach(value => {
            stack.push(value)
        })
    }

    private pushTopToNewStack0(newStack: Stack<string>, value: statementCell): void {
        newStack.pop()
        let pushVals = this.copyPushList(value)
        this.pushReverse(pushVals, newStack)
    }

    private static permute0(permutation: statementCell[]): statementCell[][] {
        let r: statementCell[] = cloneDeep(permutation)
        function cmp(a: statementCell, b: statementCell) {
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

        r = r.sort(cmp)
        let tmp: statementCell[][] = []
        let _tmp: statementCell[] = []
        let dwn: string | undefined = r[0].stackDown

        for (let i = 0; i < r.length; i++) {
            if (r[i].stackDown === dwn) {
                _tmp.push(r[i])
            } else {
                tmp.push(_tmp)
                dwn = r[i].stackDown
                _tmp = []
                _tmp.push(r[i])
            }
        }
        tmp.push(_tmp)

        let ret: statementCell[][] = []
        const _detour = (lvl: number, cur: number, acc: statementCell[]) => {
            if (lvl < tmp.length) {
                for (let i = 0; i < tmp[lvl].length; i++) {
                    let a = cloneDeep(acc)
                    a.push(tmp[lvl][i])
                    _detour(lvl + 1, i, a)
                }
            }
            else {
                ret.push(acc)
            }
        }

        _detour(0, 0, [])
        return ret
    }

    private static permute(permutation: statementCell[]): statementCell[][] {
        let length = permutation.length
        let result = [permutation.slice()]
        let c = new Array(length).fill(0)
        let i = 1
        let k: number
        let p: statementCell
        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i]
                p = permutation[i]
                permutation[i] = permutation[k]
                permutation[k] = p
                c[i]++
                i = 1
                result.push(permutation.slice())
            } else {
                c[i] = 0
                i++
            }
        }
        return result
    }

    private rmRepetitions(htable: Map<string, position>, value: position, positions: position[], idLogic: number, newStack: Stack<string>) {
        const wasCreated = (hash: string) => {
            return htable.get(hash) !== undefined
        }
        if (!wasCreated(JSON.stringify(value))) {
            positions.push({ stmt: this.statements.get(idLogic), stack: newStack })
            htable.set(
                JSON.stringify({ stmt: this.statements.get(idLogic), stack: newStack }),
                { stmt: this.statements.get(idLogic), stack: newStack }
            )
        }
    }


    public cycleEps(curLId: number, stack0: Stack<string>): position[] {
        let htable: Map<string, position> = new Map<string, position>()
        let positions: position[] = []
        let visited: boolean[] = []
        this.cellMatrix(curLId, this.epsId).forEach(() => visited.push(false))

        let permutes = this.cellMatrix(curLId, this.epsId)[0] !== undefined
            ? PDA.permute0(this.cellMatrix(curLId, this.epsId))
            : [(this.cellMatrix(curLId, this.epsId))]

        const cycle = (cell: statementCell[], idx: number, idLogic: number, stack: Stack<string>): void => {
            visited[idx] = true
            cell.forEach((value, index) => {
                if (value.idLogic === idLogic) {
                    if (value.stackDown === stack.peek()) {
                        let newCycleStack: Stack<string> = stack.cpyTo(new Stack<string>())
                        this.matchPushEpsVal(value, newCycleStack)
                        this.rmRepetitions(
                            htable,
                            { stmt: this.statements.get(idLogic), stack: newCycleStack },
                            positions,
                            idLogic,
                            newCycleStack
                        )
                        if (!visited[index]) {
                            cycle(cell, index, idLogic, newCycleStack)
                        }
                    } else if (value.stackDown === EPS) {
                        let newCycleStack: Stack<string> = stack.cpyTo(new Stack<string>())
                        this.matchDownEpsVal(value, newCycleStack)
                        this.rmRepetitions(
                            htable,
                            { stmt: this.statements.get(idLogic), stack: newCycleStack },
                            positions,
                            idLogic,
                            newCycleStack
                        )
                        if (!visited[index]) {
                            cycle(cell, index, idLogic, newCycleStack)
                        }
                    }
                }
            })
        }
        permutes.forEach((value) => {
            for (let i = 0; i < visited.length; i++) {
                visited[i] = false
            }
            cycle(value, 0, curLId, stack0)
        })

        return positions
    }

    public epsilonStep(curLId: number, stackDown: string, stack: Stack<string>, hist: HistUnit[]): position[] | undefined {
        if (this.epsId === undefined) {
            return
        }

        let visited: boolean[] = []
        for (let i = 0; i < this.statements.size; i++) {
            visited.push(false)
        }

        const dfs = (id: number, stack: Stack<string>, stDwn: string, elements: element[]): element[] => {
            this.cycleEps(id, stack).forEach(value => {
                elements.push({
                    idLogic: id,
                    top: value.stack!
                })
            })
            elements.push({
                idLogic: id,
                top: stack
            })

            visited[id] = true

            for (let i = 0; i < this.matrix[id][this.epsId].length; i++) {
                if (!visited[this.cellMatrix(id, this.epsId)[i].idLogic]) {

                    switch (this.cellMatrix(id, this.epsId)[i].stackDown) {
                        case stDwn: {
                            let newStack = stack.cpyTo(new Stack<string>())
                            this.matchPushEpsVal(this.cellMatrix(id, this.epsId)[i], newStack)
                            dfs(this.cellMatrix(id, this.epsId)[i].idLogic, newStack, newStack.peek()!, elements)
                            break
                        }
                        case EPS: {
                            let newStack = stack.cpyTo(new Stack<string>())
                            this.matchDownEpsVal(this.cellMatrix(id, this.epsId)[i], newStack)
                            dfs(this.cellMatrix(id, this.epsId)[i].idLogic, newStack, newStack.peek()!, elements)
                            break
                        }
                    }

                }
            }

            return elements
        }

        const histUnit: HistUnit[] = []
        let endsOfEpsWay: element[] = dfs(curLId, stack, stackDown, [])
        let positions: position[] = []
        for (let i = 0; i < endsOfEpsWay.length; i++) {
            let stmt = this.statements.get(this.nodes[endsOfEpsWay[i].idLogic].id)
            positions.push({
                stmt: stmt, stack: endsOfEpsWay[i].top
                , from: this.nodes[curLId]
                , cur: this.nodes[stmt.idLogic]
                , by: EPS
                , oldStack: stack
                , stackDown: stackDown
            })
            hist.push({ by: EPS, from: this.nodes[curLId], value: this.nodes[stmt.idLogic] })
        }

        return positions
    }


    private matchPushEpsVal(value: statementCell, newStack: Stack<string>): void {
        if (value.stackPush![0] === EPS) {
            if (value.stackPush!.length !== 1) {
                throw Error("pushing list should be consist by [EPS] for 'pop'")
            } else {
                newStack.pop()
            }
        } else {
            this.pushTopToNewStack0(newStack, value)
        }
    }

    private matchDownEpsVal(value: statementCell, newStack: Stack<string>): void {
        if (value.stackPush![0] === EPS && value.stackPush!.length !== 1) {
            throw Error("pushing list should be consist by [EPS] for 'pop'")
        } else if (value.stackPush![0] !== EPS) {
            let pushVals = this.copyPushList(value)
            this.pushReverse(pushVals, newStack)
        }
    }

    private letterStep(transformedInput: number, curLId: number, stackDown: string, stack: Stack<string>, hist: HistUnit[]): position[] {
        let positions: position[] = []
        const histUnit: HistUnit[] = []

        const getLetter = (id: number): any => {
            let ret
            this.alphabet.forEach((v, k) => {
                if (id === v) {
                    ret = k
                }
            })
            return ret
        }

        this.cellMatrix(curLId, transformedInput).forEach((value) => {

            switch (value.stackDown) {
                case stackDown: {
                    let newStack = stack.cpyTo(new Stack<string>())
                    this.matchPushEpsVal(value, newStack)
                    positions.push({
                        stmt: this.statements.get(value.id), stack: newStack
                        , from: this.nodes[curLId]
                        , cur: this.nodes[value.idLogic]
                        , by: getLetter(transformedInput)
                        , oldStack: stack
                        , stackDown
                    })
                    hist.push({ by: getLetter(transformedInput), from: this.nodes[curLId], value: this.nodes[value.idLogic] })
                    break
                }
                case EPS: {
                    let newStack: Stack<string> = stack.cpyTo(new Stack<string>())
                    this.matchDownEpsVal(value, newStack)
                    positions.push({
                        stmt: this.statements.get(value.id), stack: newStack
                        , from: this.nodes[curLId]
                        , cur: this.nodes[value.idLogic]
                        , by: getLetter(transformedInput)
                        , oldStack: stack
                        , stackDown: EPS
                    })
                    hist.push({ by: getLetter(transformedInput), from: this.nodes[curLId], value: this.nodes[value.idLogic] })
                    break
                }
            }

        })


        return positions
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({ idLogic: this.alphabet.get(value), value: value })
        })
        this.restart()
    }

    haveEpsilon = (): boolean => {
        return this.epsId !== undefined
    }

    isDeterministic(): boolean {
        let ret = true
        this.matrix.forEach((line) => line.forEach((cells) => {
            const fstCell = cells[0]
            const hasDublicates = cells.reduce((acc, stmt) => acc || (stmt.stackDown === fstCell.stackDown), false)

            if (cells.length > 1 && hasDublicates) {
                ret = false
            }
        }))
        return ret && (!this.haveEpsilon())
    }


    public getStartStatements = (): NodeCore[] => {

        const curs = this.curPosition.map((v) => {
            const stmt = v.stmt
            stmt.stack = v.stack?.getStorage()
            return stmt
        })

        return curs
    }

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[], byEmpty?: boolean) {
        super(graph, startStatements)

        this.admitByEmptyStack = byEmpty
        this.epsId = this.alphabet.get(EPS)

        this.stack.push(BOTTOM)
        this.curPosition = []
        this.treeHist = []
        startStatements.forEach(value => {
            let stack = new Stack<string>()
            stack.push(BOTTOM)

            this.curPosition.push({
                stmt: this.statements.get(value.id),
                stack: stack,
            })

        })
        this.setInput(input)

        if (this.epsId) {
            this.curPosition.forEach(value => {
                this.cycleEps(value.stmt.idLogic, value.stack!)
            })
        }
    }

    public haveAdmitting(positions: position[]): boolean {
        let ret = false
        if (this.admitByEmptyStack === false || this.admitByEmptyStack === undefined) {
            positions.forEach(value => {
                if (value.stmt.isAdmit) {
                    ret = true
                }
            })
            return ret
        } else {
            positions.forEach(value => {
                if (value.stack!.size() === 0) {
                    ret = true
                }
            })
            return ret
        }

    }

    private toNodes(positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            const from: NodeCore = {
                id: value.from!.id,
                isAdmit: value.from!.isAdmit,
                stack: value.oldStack ? value.oldStack.getStorage() : undefined,
                move: value.from?.move,
                output: value.from?.output,
            }

            let temp: NodeCore = {
                ...this.nodes[value.stmt.idLogic], stack: value.stack!.getStorage(),
                from,
                cur: value.cur,
                by: value.by,
                oldStack: value.oldStack!.getStorage(),
                stackDown: value.stackDown
            }
            retNodes.push(temp)
        })
        return retNodes
    }

    byEmptyStackAdmt = (isAdmt: boolean) => {
        this.admitByEmptyStack = isAdmt
    }

    protected treeHist: HistUnit[][] = []

    protected pdaStep = (): Step => {
        const histUnit: HistUnit[] = []

        let ret = this._step
            (
                this.counterSteps,
                this.alphabet.get(this.input[this.counterSteps]?.value),
                this.historiStep,
                histUnit,
                []
            )
        this.counterSteps = ret.counter
        this.historiStep = ret.history

        this.treeHist = ret.tree ? ret.tree : []


        return ret

    }

    protected pdaRun = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0

        const histUnit: HistUnit[] = []
        const histTrace: HistTrace[] = []

        for (let i = 0; i < this.input.length - 1; i++) {
            let tmp = this._step(
                this.counterStepsForResult,
                this.alphabet.get(this.input[this.counterStepsForResult].value),
                this.historiRun,
                histUnit,
                []
            )
            this.counterStepsForResult = tmp.counter
            this.historiRun = tmp.history
            histTrace.push({ byEpsPred: tmp.byEpsPred, byLetter: tmp.byLetter, byEpsAfter: tmp.byEpsAfter })
        }
        const last = this._step(
            this.counterStepsForResult,
            this.alphabet.get(this.input[this.counterStepsForResult].value),
            this.historiRun,
            histUnit,
            [],
        )
        histTrace.push({ byEpsPred: last.byEpsPred, byLetter: last.byLetter, byEpsAfter: last.byEpsAfter })

        const ret: Step = {
            nodes: last.nodes,
            counter: last.counter,
            isAdmit: last.isAdmit,
            history: last.history,
            histTrace: histTrace
        }

        console.log('ret.histTrace')
        console.log(ret.histTrace)
        console.log('ret.histTrace')

        return ret
    }

    step = this.pdaStep

    run = this.pdaRun

    protected _step = (counter: number, tr: number, histori: History[], unitHsit: HistUnit[]
        , histTrace: HistTrace[]
    ): Step => {
        const byEpsPred: NodeCore[] = []
        const byEpsAfter: NodeCore[] = []
        const byLetter: NodeCore[] = []

        let newPosSet: position[] = []

        const updCurPos = () => {
            this.curPosition = []
            newPosSet.forEach(value => this.curPosition.push(value))
            newPosSet = []
        }
        const epsStep = () => {
            this.curPosition.forEach(value => {
                let pPos = this.epsilonStep(value.stmt.idLogic, value.stack?.peek()!, value.stack!, unitHsit)
                pPos?.forEach(value1 => newPosSet.push(value1))
            })
        }
        const letterSter = () => {
            this.curPosition.forEach(value => {
                let pPos = this.letterStep(tr, value.stmt.idLogic, value.stack!.peek()!, value.stack!, unitHsit)
                pPos.forEach(value1 => newPosSet.push(value1))
            })
        }
        const rmRepeations = () => {
            let htable: Map<string, position> = new Map<string, position>()
            let positions: position[] = []
            this.curPosition.forEach(value => {
                const v: position = {
                    stmt: value.stmt, stack: value.stack
                }
                if (htable.get(JSON.stringify(v)) === undefined) {
                    positions.push(value)
                    htable.set(JSON.stringify(v), value)
                }
            })
            this.curPosition = []
            positions.forEach(value => this.curPosition.push(value))
        }

        if (this.epsId !== undefined) {
            epsStep()
            updCurPos()
            rmRepeations()
            this.toNodes(this.curPosition).forEach((v) => byEpsPred.push(v))
        }
        if (counter < this.input.length) {
            letterSter()
            updCurPos()
            rmRepeations()
            this.toNodes(this.curPosition).forEach((v) => byLetter.push(v))
            if (this.epsId !== undefined) {
                epsStep()
                updCurPos()
                rmRepeations()
                this.toNodes(this.curPosition).forEach((v) => byEpsAfter.push(v))
            }
        } else {
            rmRepeations()

            this.treeHist.push(unitHsit)

            histTrace.push({ byEpsPred, byEpsAfter, byLetter })

            return {
                nodes: this.toNodes(this.curPosition),
                counter: counter,
                isAdmit: this.haveAdmitting(this.curPosition),
                history: histori,
                tree: this.treeHist,

                byEpsPred, byEpsAfter, byLetter
                , histTrace: []
            };
        }
        rmRepeations()

        histori.push({ nodes: this.toNodes(this.curPosition), by: this.input[counter].value })
        counter++

        this.treeHist.push(unitHsit)

        histTrace.push({ byEpsPred, byEpsAfter, byLetter })

        return {
            nodes: this.toNodes(this.curPosition),
            counter: counter,
            isAdmit: this.haveAdmitting(this.curPosition),
            history: histori,
            tree: this.treeHist,

            byEpsPred, byEpsAfter, byLetter
            , histTrace: []
        };
    }

    restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.treeHist = []

        this.startStatements.forEach(value => {
            let stack = new Stack<string>()
            stack.push(BOTTOM)
            this.curPosition.push({
                stmt: this.statements.get(value.id),
                stack: stack
            })
        })
    }

}


class Queue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    dequeue(): T | undefined {
        return this.storage.shift();
    }

    size(): number {
        return this.storage.length;
    }

    getStorage(): T[] {
        return this.storage
    }
}


export class ImSet<T extends Record<any, any>> {
    private table: Map<string, T> = new Map<string, T>()
    public set: T[] = []

    private normalize(v: T): T {
        let _v = cloneDeep(v)
        _v = _v.sort()
        return _v
    }

    getItter(value: T): number {
        if (!this.has(value)) {
            throw Error
        }
        let it: number = 0
        let _v = this.normalize(value)
        this.set.forEach((value1, index) => {
            if (JSON.stringify(_v) === JSON.stringify(value1)) {
                it = index
            }
        })
        return it
    }

    has(value: T): boolean {
        let _v = this.normalize(value)
        let k = JSON.stringify(_v)
        return this.table.has(k)
    }

    myForEach(callback: (value: T, index: number) => void) {
        this.set.forEach((value1, index) => {
            callback(value1, index)
        })
    }

    add(value: T) {
        let _v = this.normalize(value)
        let k = JSON.stringify(_v)
        if (!this.table.has(k)) {
            this.table.set(k, _v)
            this.set.push(_v)
        }
    }

    size(): number {
        return this.set.length
    }

    getNth(i: number): T {
        return this.set[i]
    }

    getIter(value: T): number {
        let _v = this.normalize(value)
        let k = JSON.stringify(_v)
        let iter = 0
        this.set.forEach((v, index) => {
            if (JSON.stringify(v) === k) {
                iter = index
            }
        })
        return iter
    }

    getStorage(): T[] {
        return this.set
    }
}
