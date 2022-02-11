import {History, position, statement, Step} from "./Types";
import {EdgeCore, GraphCore, GraphEval, Move, NodeCore, TransitionParams} from "./IGraphTypes";
import {BOTTOM, Computer, EPS, statementCell} from "./Computer";
import {Stack} from "./Stack";
import {cloneDeep} from "lodash";

export type statementCells = Array<statementCell>

type element = {
    idLogic: number
    top: Stack<string>
}


export class PDA extends Computer {

    private epsId: any
    // protected matrix: statementCells[][] = []
    private stack: Stack<string> = new Stack<string>()
    protected curPosition: position[]
    // protected historiStep: History[] = []
    // protected historiRun: History[] = []
    private admitByEmptyStack: boolean | undefined


    private copyPushList (value: statementCell): string[] {
        let cpy: string[] = []
        value.stackPush?.forEach(value => cpy.push(value))
        return cpy
    }

    private pushReverse (pushVals: string[], stack: Stack<string>) {
        pushVals.reverse().forEach(value => {
            stack.push(value)
        })
    }

    private pushTopToNewStack0 (newStack: Stack<string>, value: statementCell): void  {
        newStack.pop()
        let pushVals = this.copyPushList(value)
        this.pushReverse(pushVals, newStack)
    }

    private static permute0(permutation: statementCell[]): statementCell[][] {
        let r: statementCell[] = cloneDeep(permutation)
        function cmp(a : statementCell, b : statementCell) {
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
        let tmp: statementCell [][] = []
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
        const _detour  = (lvl: number, cur: number, acc: statementCell[]) => {
            if (lvl < tmp.length) {
                for (let i = 0; i < tmp[lvl].length; i++) {
                    let a = cloneDeep(acc)
                    a.push(tmp[lvl][i])
                    _detour (lvl + 1, i, a)
                }
            }
            else {
                ret.push(acc)
            }
        }

        _detour(0,0,[])
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

    private rmRepetitions (htable: Map<string, position>, value: position, positions: position[], idLogic: number, newStack: Stack<string>) {
        const wasCreated = (hash: string) => {
            return htable.get(hash) !== undefined
        }
        if (!wasCreated(JSON.stringify(value))) {
            positions.push({stmt: this.statements.get(idLogic), stack: newStack})
            htable.set(
                JSON.stringify({stmt: this.statements.get(idLogic), stack: newStack}),
                {stmt: this.statements.get(idLogic), stack: newStack}
            )
        }
    }


    public cycleEps (curLId: number, stack0: Stack<string>): position[] {
        let htable: Map<string, position> = new Map<string, position>()
        let positions: position[] = []
        let visited: boolean[] = []
        this.cellMatrix(curLId, this.epsId).forEach(() => visited.push(false))

        let permutes = this.cellMatrix(curLId, this.epsId)[0] !== undefined ? PDA.permute0 (this.cellMatrix(curLId, this.epsId)) : [(this.cellMatrix(curLId, this.epsId))]
        // permutes.push(this.cellMatrix(curLId, this.epsId))
        // let permutes: statementCell[][] = PDA.permute(this.cellMatrix(curLId, this.epsId))

        const cycle = (cell: statementCell[], idx: number, idLogic: number, stack: Stack<string>): void => {
            visited[idx] = true
            cell.forEach((value, index)=> {
                if (value.idLogic === idLogic) {
                    if (value.stackDown === stack.peek()) {
                        let newCycleStack: Stack<string> = stack.cpyTo(new Stack<string>())
                        this.matchPushEpsVal(value, newCycleStack)//
                        this.rmRepetitions(
                            htable,
                            {stmt: this.statements.get(idLogic), stack: newCycleStack},
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
                            {stmt: this.statements.get(idLogic), stack: newCycleStack},
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

    private epsilonStep (curLId: number, stackDown: string, stack: Stack<string>): position[] | undefined {
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
                if (!visited[this.cellMatrix(id, this.epsId)[i].idLogic] ) {

                    switch (this.cellMatrix(id, this.epsId)[i].stackDown) {
                        case stDwn : {
                            let newStack = stack.cpyTo(new Stack<string>())
                            this.matchPushEpsVal(this.cellMatrix(id, this.epsId)[i], newStack)
                            dfs(this.cellMatrix(id, this.epsId)[i].idLogic, newStack, newStack.peek()!, elements)
                            break
                        }
                        case EPS : {
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

        let endsOfEpsWay: element[] = dfs(curLId, stack, stackDown, [])
        let positions: position[] = []
        for (let i = 0; i < endsOfEpsWay.length; i++) {
            let stmt = this.statements.get(this.nodes[endsOfEpsWay[i].idLogic].id)
            positions.push({stmt: stmt, stack: endsOfEpsWay[i].top})
        }

        return positions
    }

    private matchPushEpsVal (value: statementCell, newStack: Stack<string>): void {
        if (value.stackPush![0] === EPS) {
            if (value.stackPush!.length !== 1) {
                throw Error ("pushing list should be consist by [EPS] for 'pop'")
            } else {
                newStack.pop()
            }
        } else {
            this.pushTopToNewStack0(newStack, value)
        }
    }

    private matchDownEpsVal (value: statementCell, newStack: Stack<string>): void {
        if (value.stackPush![0] === EPS && value.stackPush!.length !== 1) {
            throw Error("pushing list should be consist by [EPS] for 'pop'")
        } else if (value.stackPush![0] !== EPS) { //??
            let pushVals = this.copyPushList(value)
            this.pushReverse(pushVals, newStack)
        }
    }

    private letterStep (transformedInput: number, curLId: number, stackDown: string, stack: Stack<string>): position[] {
        let positions: position[] = []

        this.cellMatrix(curLId, transformedInput).forEach((value) => {

            switch (value.stackDown) {
                case stackDown : {
                    let newStack = stack.cpyTo(new Stack<string>())
                    this.matchPushEpsVal(value, newStack)
                    positions.push({stmt: this.statements.get(value.id), stack: newStack})
                    break
                }
                case EPS : {
                    let newStack: Stack<string> = stack.cpyTo(new Stack<string>())
                    this.matchDownEpsVal(value, newStack)
                    positions.push({stmt: this.statements.get(value.id), stack: newStack})
                    break
                }
            }

        })

        return positions
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
        })
        this.restart()
    }

    protected haveEpsilon(): boolean {
        return this.epsId !== undefined
    }

    protected isDeterministic(): boolean {
        let ret = true
        this.matrix.forEach(value => {
            value.forEach(value1 => {
                if (value1.length > 1) {
                    let tmp: statementCell = value1[0]
                    value1.forEach((value2, index) => {
                        if (index !== 0 && tmp.stackDown === undefined && value2.stackDown || index !== 0 && tmp.stackDown === value2.stackDown ) {
                            ret = false
                        }
                    })
                }

            })
        })
        return ret && (!this.haveEpsilon())
    }

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[], byEmpty?: boolean) {
        super(graph, startStatements)

        this.admitByEmptyStack = byEmpty
        this.epsId = this.alphabet.get(EPS)
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
        this.stack.push(BOTTOM)
        this.curPosition = []//{stack: new Stack<string>(), stmt: startStatements}

        startStatements.forEach(value => {
            let stack = new Stack<string>()
            stack.push(BOTTOM)

            this.curPosition.push({
                stmt: this.statements.get(value.id),
                stack: stack
            })

        })
        this.setInput(input)

        if (this.epsId) {//
            this.curPosition.forEach(value => {
                this.cycleEps(value.stmt.idLogic, value.stack!)
            })
            ////// this.cycleEps(this.curPosition[0].stmt.idLogic, this.curPosition[0].stack!)
        }//
        console.log('-------------------------')
        console.log(this.isDeterministic())
        console.log("ALPHBT")
        this.alphabet.forEach((value, key) => console.log(value, key))
        console.log("STMTS")
        this.statements.forEach(value => console.log(value))
        console.log("MTX")
        this.matrix.forEach(value => {
            console.log()
            value.forEach(value1 => console.log(value1))
        })
        console.log('-------------------------')
    }

    protected haveAdmitting (positions: position[]): boolean {
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
            // console.log("ADMT")
            // console.log(ret)
            return ret
        }

    }

    private toNodes (positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            let temp: NodeCore = { ...this.nodes[value.stmt.idLogic], stack: value.stack!.getStorage() }
            retNodes.push(temp)
        })
        return retNodes
    }

    byEmptyStackAdmt = (isAdmt: boolean) => {
        this.admitByEmptyStack = isAdmt
    }

    step = (): Step => {
        let ret = this._step
        (
            this.counterSteps,
            this.alphabet.get(this.input[this.counterSteps]?.value),
            this.historiStep
        )
        this.counterSteps = ret.counter
        this.historiStep = ret.history


        console.log("STEP stck: ")
        ret.history.forEach(value => value.nodes.forEach(value1 => console.log(value1.stack)))
        console.log("STEP admit: ")
        console.log(ret.isAdmit)

        return ret

    }

    run = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0

        for (let i = 0; i < this.input.length - 1; i++) {
            let tmp = this._step(
                this.counterStepsForResult,
                this.alphabet.get(this.input[this.counterStepsForResult].value),
                this.historiRun
            )
            this.counterStepsForResult = tmp.counter
            this.historiRun = tmp.history
        }

        return this._step(
            this.counterStepsForResult,
            this.alphabet.get(this.input[this.counterStepsForResult].value),
            this.historiRun
        )
    }

    protected _step = (counter: number, tr: number, histori: History[]): Step => {
        let newPosSet: position[] = []
        const updCurPos = () => {
            this.curPosition = []
            newPosSet.forEach(value => this.curPosition.push(value))
            newPosSet = []
        }
        const epsStep = () => {
            this.curPosition.forEach(value => {
                let pPos = this.epsilonStep(value.stmt.idLogic, value.stack?.peek()!, value.stack!)
                pPos?.forEach(value1 => newPosSet.push(value1))
            })
        }
        const letterSter = () => {
            this.curPosition.forEach(value => {
                let pPos = this.letterStep(tr, value.stmt.idLogic, value.stack!.peek()!, value.stack!)
                pPos.forEach(value1 => newPosSet.push(value1))
            })
        }
        const rmRepeations = () => {
            let htable: Map<string, position> = new Map<string, position>()
            let positions: position[] = []
            this.curPosition.forEach(value => {
                if (htable.get(JSON.stringify(value)) === undefined) {
                    positions.push(value)
                    htable.set(JSON.stringify(value), value)
                }
            })
            this.curPosition = []
            positions.forEach(value => this.curPosition.push(value))
        }

        if (this.epsId !== undefined) {
            epsStep()
            updCurPos()
        }
        if (counter < this.input.length) {
            letterSter()
            updCurPos()
            if (this.epsId !== undefined) {
                epsStep()
                updCurPos()
            }
        } else {
            rmRepeations()

            // console.log(":::::::::::::::::::")
            // this.curPosition.forEach(value => {
            //     console.log(value.stmt)
            //     console.log(value.stack)
            // })
            // console.log(":::::::::::::::::::")

            return {
                nodes: this.toNodes(this.curPosition),
                counter: counter,
                isAdmit: this.haveAdmitting(this.curPosition),
                history: histori
            };
        }
        rmRepeations()

        // console.log(":::::::::::::::::::")
        // this.curPosition.forEach(value => {
        //     console.log(value.stmt)
        //     console.log(value.stack)
        // })
        // console.log(":::::::::::::::::::")

        histori.push({nodes: this.toNodes(this.curPosition), by: this.input[counter].value})
        counter++

        return {
            nodes: this.toNodes(this.curPosition),
            counter: counter,
            isAdmit: this.haveAdmitting(this.curPosition),
            history: histori
        };
    }

    restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.startStatements.forEach(value => {
            let stack = new Stack<string>()
            stack.push(BOTTOM)
            this.curPosition.push({
                stmt: this.statements.get(value.id),
                stack: stack
            })
        })
    }

// move to Nfa
    nfaToDfa = (): GraphCore => {
        const nextStepPosition = (position: position, by: number): position[] => {
            return this.cellMatrix(position.stmt.idLogic, by).map(v => ({stmt: v}))
        }

        const _nextStepPositions = (positions: position[], by: number): position[] => {
            let acc: position[] = []
            positions.map((v) =>
                nextStepPosition(v, by)).forEach((ps) =>
                    ps.forEach((p) => acc.push(p)))
            return acc
        }

        const nextStepPositions = (positions: position[], by: number): position[] => {

            const afterEps = (positions: position[]): position[] => {
                if (this.epsId === undefined) {
                    return positions
                }
                const acc: position[][] = []
                const EPStack = new Stack<string>()
                EPStack.push(EPS)
                positions.forEach((position) => {
                    const tmp = this.epsilonStep(position.stmt.idLogic, EPS, EPStack)
                    if (tmp !== undefined) {
                        acc.push(tmp)
                    }
                })

                const flatted: position[] = []
                acc.forEach((ps) => ps.forEach((p) => flatted.push(p)))

                return flatted
            }

            return afterEps(_nextStepPositions(afterEps(positions), by))
        }

        const pop = () => stack.shift()

        const push = (v: position[]): void => {
            stack.push(v)
        }

        const stack: position[][] = []
        const table: position[][][] = []
        const set: ImSet<position[]> = new ImSet<position[]>()
        const startPos = this.curPosition

        this.restart()
        push(startPos)

        while(stack.length > 0) {
            let head = pop()
            let acc: position[][] = []

            if (head === undefined || head.length === 0) {
                break;
            }
            if (set.has(head)) {
                continue
            }
            set.add(head.map((v) => (
                {
                    stmt: {
                        id: v.stmt.id,
                        idLogic: v.stmt.idLogic,
                        isAdmit: v.stmt.isAdmit
                    },
                    stack: undefined
                }))
            )

            this.alphabet.forEach((value) => {
                if (value !== this.epsId) {
                    let to: position[] = nextStepPositions(head!, value)
                    let _to: position[] = to.map((v) => (
                        {
                            stmt: {
                                id: v.stmt.id,
                                idLogic: v.stmt.idLogic,
                                isAdmit: v.stmt.isAdmit
                            },
                            stack: undefined
                        })
                    )
                    acc.push(_to)
                    if (to.length > 0 && !set.has(to) && !set.has(_to)) {
                        push(_to)
                    }
                }
            })
            table.push(acc)
        }

        const _edges: EdgeCore[] = []
        table.forEach((ps, from) => {
            this.alphabet.forEach((tr, letter) => {
                if (tr !== this.epsId && ps[tr].length !== 0) {
                    console.log(ps[tr])
                    console.log(from, set.getIter(ps[tr]))
                    _edges.push({
                        from: from,
                        to: set.getIter(ps[tr]),
                        transitions: new Set<TransitionParams[]>([[{title: letter}]])
                    })
                }
            })
        })

        const nodes: NodeCore[] = set.getStorage().map((v) => ({
            id: set.getIter(v),
            isAdmit: this.haveAdmitting(v),
        }))

        const edges: EdgeCore[] = []

        _edges.sort((a, b) => a.from - b.from || a.to - b.to)
        for (let i = 0; i < _edges.length; i++) {
            const acc: TransitionParams[] = []
            let delta = 0
            for (let j = i; j < _edges.length; j++) {
                if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                    acc.push(Array.from(_edges[j].transitions)[0][0])
                    delta++
                }
            }
            edges.push({
                from: _edges[i].from,
                to: _edges[i].to,
                transitions: new Set<TransitionParams[]>([acc])
            })
            i += delta - 1
        }

        return { nodes: nodes, edges: edges }
    }


//https://www.usna.edu/Users/cs/wcbrown/courses/F17SI340/lec/l22/lec.html
    minimizeDfa = (): GraphEval => {
        this.restart()
        const startId = this.curPosition[0].stmt.idLogic

        type groupElement = {
            number: number
            node: statement,
        }

        const cutBy = (by: number): statementCell[] => {
            const acc: statementCell[] = []
            this.matrix.forEach((_, it) => acc.push(this.cellMatrix(it, by)[0]))
            return acc
        }

        const _lookUp = (group: groupElement[]) => (id: number): groupElement => {
            return group[id]
        }

        const _getJump = (table: groupElement[][]) => (by: number) => (id: number): groupElement => {
            return table[by][id]
        }

        const createTableT = (zero: groupElement[]): groupElement[][] => {
            const lookUp = _lookUp(zero)
            const table: groupElement[][] = []
            this.alphabet.forEach((tr) => {
                const acc: groupElement[] = []
                const cutted = cutBy(tr)
                cutted.forEach((cell) => {
                    acc.push(lookUp(cell.idLogic))
                })
                table.push(acc)
            })
            return table
        }

        const _updateGroups = (zero: groupElement[]) => (groups: groupElement[][]) => (getJump: (id: number) => groupElement) => (group: groupElement[]): {fst: groupElement[], snd: groupElement[]} => {
            const jmpGrp = getJump(group[0].node.idLogic).number
            const newGrp: groupElement[] = []
            const newNumber = groups.length + 1
            const toRm: number[] = []

            group.forEach((value, index) => {
                if (getJump(value.node.idLogic).number !== jmpGrp) {
                    value.number = newNumber
                    toRm.push(value.node.idLogic)
                    newGrp.push(value)
                }
            })

            for (let i = 0; i < group.length; i++) {
                if (toRm.includes(group[i].node.idLogic)) {
                    group.splice(i, 1)
                    i--
                }
            }

            if (newGrp.length > 0) {
                groups.push(newGrp)
                return {fst: group, snd: newGrp}
            }
            return { fst: [], snd: [] }
        }

        const stack: groupElement[][] = []

        const pop = (): groupElement[] | undefined => stack.shift()

        const push = (v: groupElement[]) => stack.push(v)

        const zero: groupElement[] = []
        const first: groupElement[] = []
        const second: groupElement[] = []
        this.statements.forEach((statement) => {
            let element: groupElement = { number: -1, node: {idLogic: -1, id: -1, isAdmit: false} }
            if (statement.isAdmit) {
                element = { number: 1, node: statement }
                first.push(element)
            } else {
                element = { number: 2, node: statement }
                second.push(element)
            }
            zero.push(element)
        })

        const groups: groupElement[][] = []
        groups.push(first)
        groups.push(second)

        const table = createTableT(zero)

        this.alphabet.forEach((tr) => {
            groups.forEach((stmt) => push(stmt))
            const getJump = _getJump(table)(tr)
            const updateGroups = _updateGroups(zero)(groups)(getJump)
            while (stack.length > 0) {
                const head = pop()
                if (head === undefined) {
                    break
                }
                const newGrp = updateGroups(head)
                if (newGrp.fst.length > 0) {
                    push(newGrp.fst)
                    push(newGrp.snd)
                }
            }
        })

        const toPositions = (group: groupElement[]): position[] => group.map((g) => ({ stmt: g.node }))

        const grpAfterJmp = (group: groupElement[], by: number): number => _getJump(table)(by)(group[0].node.idLogic).number

        const nodes: NodeCore[] = groups.map((group) => ({ id: group[0].number, isAdmit: this.haveAdmitting(toPositions(group)) }))
        const edges: EdgeCore[] = groups.reduce((acc: EdgeCore[], g) => {
            this.alphabet.forEach((tr, letter) => {
                acc.push({
                    from: g[0].number,
                    to: grpAfterJmp(g, tr),
                    transitions: new Set<TransitionParams[]>([[{title: letter}]])
                })
            })
            return acc
        }, [])

        console.log(nodes)

        const startGrp = groups.filter((g) => {
            const gIds = g.map(v => v.node.idLogic)
            return gIds.includes(startId)
        })


        const start = nodes[startGrp[0][0].number - 1]

        return { graphcore: {nodes: nodes, edges: edges}, start }
    }

}


class Queue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

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

// let nfa = new PDA (
//     {
//         nodes: [
//             {id: 0, isAdmit: false},
//             {id: 1, isAdmit: false}
//
//         ],
//         edges: [
//             {from: 0, to: 1, transitions: new Set([    [{title:      '0', stackDown: 'Z0', stackPush: [EPS] } ]])},
//         ]
//     }, [{id: 0, isAdmit: false}], ["0"],
// )
// nfa.byEmptyStackAdmt(true)
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