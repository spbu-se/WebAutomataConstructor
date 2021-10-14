import {History, statement, Step} from "./Types";
import {GraphCore, Move, NodeCore} from "./IGraphTypes";
import {BOTTOM, Computer, EPS} from "./Computer";
import {Stack} from "./Stack";

type statementCell = {
    readonly stackDown?: string
    readonly stackPush?: string[]
    readonly move?: Move
} & statement

type statementCells = Array<statementCell>

type element = {
    idLogic: number
    top: Stack<string>
}

type position = {
    stmt: statement,
    stack?: Stack<string>
}

export class PDA extends Computer {

    private epsId: any
    protected matrix: statementCells[][] = []
    private stack: Stack<string> = new Stack<string>()
    protected curPosition: position[]
    protected historiStep: History[] = []
    protected historiRun: History[] = []
    private admitByEmptyStack: boolean | undefined


    private createMatrix(): void {
        for (let i = 0; i < this.statements.size; i++) {
            this.matrix[i] = []
            for (let j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = []//{idLogic: -1, id: -1, isAdmit: false, stackDown: "empty", stackPush: []}
            }
        }
        for (let i = 0; i < this.edges.length; i++) {
            let statementFrom: statement = this.statements.get(this.edges[i].from)
            let statementTo: statement = this.statements.get(this.edges[i].to)
            for (let j = 0; j < this.edges[i].localValue.length; j++) {
                let letterId = this.alphabet.get(this.edges[i].localValue[j].title)
                // console.log(letterId)
                let stDwn = this.edges[i].localValue[j].stackDown
                let stPsh = this.edges[i].localValue[j].stackPush
                let mv = this.edges[i].localValue[j].move
                if (stDwn === undefined || stPsh === undefined) {
                    stDwn = EPS
                    stPsh = [EPS]
                }
                // console.log(statementTo.move)
                this.matrix[statementFrom.idLogic][letterId].push({
                    ...statementTo,
                    stackDown: stDwn,
                    stackPush: stPsh,
                    move: mv
                })
            }
        }
    }

    protected cellMatrix (i: number, j: number) : statementCell[] {
        return this.matrix[i][j]
    }

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
        let permutes: statementCell[][] = PDA.permute(this.cellMatrix(curLId, this.epsId))

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
        this.createMatrix()
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

        if (this.epsId) {
            this.cycleEps(this.curPosition[0].stmt.idLogic, this.curPosition[0].stack!)
        }
        console.log(this.isDeterministic())
    }

    private haveAdmitting (positions: position[]): boolean {
        let ret = false
        if (this.admitByEmptyStack === false || this.admitByEmptyStack === undefined) {
            positions.forEach(value => {
                if (value.stmt.isAdmit) {
                    ret = true
                }
            })
            return false
        } else {
            positions.forEach(value => {
                if (value.stack!.size() === 0) {
                    ret = true
                }
            })
            return ret
        }

    }

    private toNodes (positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            let temp: NodeCore = {...this.nodes[value.stmt.idLogic], stack: value.stack!.getStorage()
            }
            retNodes.push(temp)
        })
        return retNodes
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
                let pPos = this.epsilonStep(value.stmt.idLogic, value.stack!.peek()!, value.stack!)
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

}
