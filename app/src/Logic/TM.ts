import {History, position, Step} from "./Types";
import {GraphCore, NodeCore, Move} from "./IGraphTypes";
import {PDA} from "./PDA";

export class TMMemory {
    private storage: string[] = ['B']
    private pointer: number = 0

    reset (): void {
        this.storage = ['B']
        this.pointer = 0
    }

    lookUp (): string {
        return this.storage[this.pointer]
    }

    initialize (init: string[]): void {
        init.forEach(value => this.mvRight('B', value))
        this.pointer = 0
    }

    mvRight (curr: string, upd: string): void {
        if (this.storage[this.pointer] === curr) {
            this.storage[this.pointer] = upd
            this.pointer++
        }
        if (this.pointer === this.storage.length) {
            this.storage.push('B')
        }
    }

    mvLeft (curr: string, upd: string): void {
        if (this.pointer === 0) {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd
                this.pointer = 0
            }
            let tmp = ['B']
            this.storage.forEach(value => tmp.push(value))
            this.storage = tmp
        } else {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd
                this.pointer--
            }
        }
    }

    getStorage (): string[] {
        return this.storage
    }

}

export class TM extends PDA {
    public mem = new TMMemory()

    private checkMemFormat (graph: GraphCore): void {
        let isMtMem = true
        graph.edges.forEach(value => value.transitions.forEach(value1 => {
            if (value1.stackPush?.length && value1.stackPush?.length > 1) {
                isMtMem = false
            }
        }))
        if (!isMtMem) {
            throw Error("Not MT mem")
        }

    }

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        this.checkMemFormat(graph)
        if (!this.isDeterministic()) {
            throw Error ("Not deterministic")
        }
        this.mem.initialize(input)
        this.curPosition = [{
            stmt: this.statements.get(this.startStatements[0].id)
        }]
    }

    private curMt (): position {
        return this.curPosition[0]
    }

    private assignCurMt (newPos: position): void {
        this.curPosition[0] = newPos
    }

    public __step = (counter: number, tr: number, histori: History[]): Step => {
        if (counter < this.input.length) {
            this.cellMatrix(this.curPosition[0].stmt.idLogic, tr).forEach((value) => {
                if (value.stackDown === this.mem.lookUp()) {
                    if (value.move === Move.R) {
                        this.mem.mvRight(value.stackDown, value.stackPush![0])
                    }
                    if (value.move === Move.L) {
                        this.mem.mvLeft(value.stackDown, value.stackPush![0])
                    }
                    this.assignCurMt({stmt: this.statements.get(value.id)})
                }
            })
            histori.push({
                nodes: [this.nodes[this.curPosition[0].stmt.idLogic]],
                by: this.input[counter].value
            })
        }
        counter++
        return {
            nodes: [this.nodes[this.curPosition[0].stmt.idLogic]],
            counter: counter,
            history: histori,
            isAdmit: this.curPosition[0].stmt.isAdmit,
            memory: this.mem.getStorage()
        }
    }

    restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.mem.reset()
    }

    run = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0
        for (let i = 0; i < this.input.length - 1; i++) {
            let tmp = this.__step(
                this.counterStepsForResult,
                this.alphabet.get(this.input[this.counterStepsForResult].value),
                this.historiRun
            )
            this.counterStepsForResult = tmp.counter
            this.historiRun = tmp.history
        }
        return {
            ...this.__step(
                this.counterStepsForResult,
                this.alphabet.get(this.input[this.counterStepsForResult].value),
                this.historiRun),
            memory: this.mem.getStorage()
        }
    }

    step = (): Step => {
        let ret = this.__step
        (
            this.counterSteps,
            this.alphabet.get(this.input[this.counterSteps]?.value),
            this.historiStep
        )
        this.counterSteps = ret.counter
        this.historiStep = ret.history
        return {
            ...ret,
            memory: this.mem.getStorage()
        }
    }



}

// let nfa = new TM(
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//
//         ],
//         edges: [
//             {from: 1, to: 1, transitions: new Set([{title: 'a', stackDown: 'a', stackPush: ['A'], move: Move.R}])},
//             {from: 1, to: 2, transitions: new Set([{title: 'c', stackDown: 'b', stackPush: ['V'], move: Move.R}])},
//             {from: 2, to: 2, transitions: new Set([{title: 'c', stackDown: 'B', stackPush: ['V'], move: Move.R}])},
//
//
//
//         ]
//     }, [{id: 1, isAdmit: false}], ['a', 'a', 'c'])
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
// console.log(nfa.step())
//
