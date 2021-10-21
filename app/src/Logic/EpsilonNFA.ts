import {position, Step} from "./Types";
import {EdgeCore, GraphCore, NodeCore, TransitionParams} from "./IGraphTypes";
import {PDA} from "./PDA";
import {cloneDeep} from "lodash";

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
}


export class ImSet<T extends Record<any, any>> {
    private table: Map<string, T> = new Map<string, T>()
    public set: T[] = []

    private normalize (v: T): T {
        let _v = cloneDeep(v)
        _v = _v.sort()
        return _v
    }

    getItter (value: T): number {
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

    has (value: T): boolean {
        let _v = this.normalize(value)
        let k = JSON.stringify(_v)
        return this.table.has(k)
    }

    myForEach (callback: (value: T, index: number) => void) {
        this.set.forEach((value1, index) => {
            callback(value1, index)
        })
    }

    add (value: T) {
        let _v = this.normalize(value)
        let k = JSON.stringify(_v)
        if (!this.table.has(k)) {
            this.table.set(k, _v)
            this.set.push(_v)
        }
    }

    size (): number {
        return this.set.length
    }

    getNth (i: number): T {
        return this.set[i]
    }

    getIter (value: T): number {
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
}

export class EpsilonNFA extends PDA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)

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
        ret.nodes.forEach(value => value.stack = undefined)
        ret.history.forEach(value => value.nodes.forEach(value1 => value1.stack = undefined))

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

        let ret = this._step(
            this.counterStepsForResult,
            this.alphabet.get(this.input[this.counterStepsForResult].value),
            this.historiRun
        )

        ret.nodes.forEach(value => value.stack = undefined)
        ret.history.forEach(value => value.nodes.forEach(value1 => value1.stack = undefined))

        return ret
    }

    nfaToDfa = () => {
        this.restart()
        let start: position[] = this.curPosition
        let dfaStmts: ImSet<position[]> = new ImSet<position[]>()
        let tmp: position[][] = []
        let i = 0
        let dfaMatrix: position[][][] = []

        dfaStmts.add(this.curPosition)
        while (i < dfaStmts.size()) {
            this.curPosition = dfaStmts.getNth(i)
            this.alphabet.forEach((value) => {
                this._step(0, value, [])
                if (this.curPosition.length > 0) {
                    dfaStmts.add(this.curPosition)
                }
                tmp.push(this.curPosition)
                this.curPosition = dfaStmts.getNth(i)
            })
            dfaMatrix.push(tmp)
            tmp = []
            i++
        }

        let nodes: NodeCore[] = []
        let edges: EdgeCore[] = []
        let mp: Map<string, number> = new Map<string, number>()

        dfaStmts.myForEach((value, index) => {
            mp.set(JSON.stringify(value), index)
            let isAdmt = this.haveAdmitting(value)
            nodes.push({id: index, isAdmit: isAdmt})
        })

        dfaStmts.myForEach((value, index) => {
            this.alphabet.forEach((value1, key) => {
                let from = mp.get(JSON.stringify(value))!
                let to = mp.get(JSON.stringify(dfaMatrix[from][value1]))
                if (to) {
                    edges.push({from: from, to: to, transitions: new Set<TransitionParams>([{title: key}])})
                }
            })
        })

        return {nodes: nodes, edges: edges}
        // let accepted: position[][][] = []
        // let nonAccepted: ImSet<position[]> = new ImSet<position[]>()
        //
        // dfaStmts.myForEach((value) => this.haveAdmitting(value) ? accepted.push([value]) : nonAccepted.add(value))
        //
        // let q: Queue<{ pos: position[], trL: number }> = new Queue<{pos: position[]; trL: number}>()
        // nonAccepted.myForEach(value => {
        //     this.alphabet.forEach(value1 => {
        //         q.enqueue({pos: value, trL: value1})
        //     })
        // })
        //
        // const mSt = (idLetter: number, nonAccepted: ImSet<position[]>, accepted: position[][][]): { accepted: position[][][], nonAccepted: ImSet<position[]> } => {
        //     let accps: position[][][] = cloneDeep(accepted)
        //     let nonAccps: ImSet<position[]> = new ImSet<position[]>()
        //     let acc: position[][] = []
        //     nonAccepted.myForEach(value => {
        //         this.curPosition = value
        //         this._step(0, idLetter, [])
        //         if (nonAccepted.has(this.curPosition)) {
        //             nonAccps.add(value)
        //         } else {
        //             acc.push(value)
        //         }
        //     })
        //     if (acc.length > 0) {
        //         accps.push(acc)
        //     }
        //     return { nonAccepted: nonAccps, accepted: accps }
        // }
        //
        // while (nonAccepted.size() > 0) {
        //     this.alphabet.forEach((value) => {
        //         let upd = mSt(value, nonAccepted, accepted)
        //         nonAccepted = upd.nonAccepted
        //         accepted = upd.accepted
        //     })
        // }
        // console.log(";;;;;;;;;;;;;;;;;;")
        // accepted.forEach(value => {
        //     console.log()
        //     value.forEach(value1 => console.log(value1))
        // })
        // console.log(";;;;;;;;;;;;;;;;;;")

        // let mp: Map<string, position[][]> = new Map<string, position[][]>()
        // accepted.forEach(value => value.forEach(value1 => mp.set(JSON.stringify(value1), value)))
        // // console.log("____________--!*")
        // for (let i = 0; i < dfaMatrix.length; i++) {
        //     for (let j = 0; j < dfaMatrix[i].length; j++) {
        //         for (let k = 0; k < dfaMatrix[i][j].length; k++) {
        //             let newVal: position[][] | undefined = mp.get(JSON.stringify(dfaMatrix[i][j][k]))
        //             console.log(JSON.stringify(dfaMatrix[i][j][k]))
        //             console.log(mp.get(JSON.stringify(dfaMatrix[i][j][k])))
        //             console.log(newVal)
        //
        //             if (newVal) {
        //                 // dfaMatrix[i][j][j] = newVal
        //                 console.log("ADFASFDSAFSDFSDFSDF")
        //                 dfaMatrix[i][j][k] = []
        //                 newVal.forEach(value => value.forEach(value1 => {
        //                     dfaMatrix[i][j][k].push(value1)
        //                 }))
        //                 // console.log(mp.get(JSON.stringify(dfaMatrix[i][j])))
        //             }
        //         }
        //     }
        // }

        // console.log("____________--!*")
        // dfaMatrix.forEach(value => value.forEach(value1 => {
        //     console.log()
        //     value1.forEach(value2 => {
        //         console.log(value2)
        //     })
        // }))
        // console.log("____________--!*")
        //
        // console.log("*!*!*!!**!*!*")
        // console.log(mp)
        // console.log("*!*!*!!**!*!*")
        //
        // console.log(":DSF::SD:F")
        // let dfaMinMtrx: position[][][] = []
        // accepted.forEach(value => {
        //     console.log()
        //     let tmp: position[][] = []
        //
        //     value.forEach(value1 => {
        //         console.log(value1)
        //         console.log(dfaStmts.getItter(value1))
        //
        //         let i = dfaStmts.getItter(value1)
        //         this.alphabet.forEach(value3 => {
        //             tmp.push(dfaMatrix[i][value3])
        //         })
        //     })
        //     dfaMinMtrx.push(tmp)
        // })
        // this.alphabet.forEach(key => console.log(key))
        // accepted.forEach(value => {
        //     console.log("~~~~~~~~~~~~~~~~~~~")
        //     value.forEach(value1 => {
        //         console.log(value1)
        //     })
        //     console.log("~~~~~~~~~~~~~~~~~~~")
        // })
        //
        // dfaMinMtrx.forEach(value => {
        //     console.log("{}{}{}{")
        //     value.forEach(value1 => {
        //         console.log()
        //         console.log(value1)
        //     })
        // })

        // findStart(accepted, start).forEach(value => value.forEach(value1 => {
        //     console.log(value1)
        // }))

        // let a = findStart(accepted, start)
        // let ppp: position[] = []
        // a.forEach(value => {
        //     value.forEach(value1 => ppp.push(value1))
        // })
    }

}
//
// let nfa = new EpsilonNFA(
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//             {id: 3, isAdmit: false},
//             {id: 4, isAdmit: false},
//             {id: 5, isAdmit: false},
//             {id: 6, isAdmit: false},
//             {id: 7, isAdmit: false},
//             {id: 8, isAdmit: false},
//             {id: 9, isAdmit: false},
//             {id: 10, isAdmit: false},
//             {id: 11, isAdmit: false},
//             {id: 12, isAdmit: false},
//
//         ],
//         edges: [
//             {from: 1, to: 2, transitions: new Set([     {title:      EPS}])},
//             {from: 1, to: 8, transitions: new Set([     {title:      EPS }])},
//             {from: 2, to: 3, transitions: new Set([     {title:      EPS }])},
//             {from: 2, to: 9, transitions: new Set([     {title:      EPS }])},
//             {from: 3, to: 4, transitions: new Set([     {title:      EPS }])},
//             {from: 3, to: 6, transitions: new Set([     {title:      EPS }])},
//             {from: 4, to: 5, transitions: new Set([     {title:      'a' }])},
//             {from: 5, to: 4, transitions: new Set([     {title:      EPS }])},
//             {from: 5, to: 6, transitions: new Set([     {title:      EPS }])},
//             {from: 6, to: 7, transitions: new Set([     {title:      EPS }])},
//             {from: 7, to: 2, transitions: new Set([     {title:      EPS }])},
//             {from: 7, to: 8, transitions: new Set([     {title:      EPS }])},
//             {from: 9, to: 10, transitions: new Set([    {title:      EPS }])},
//             {from: 9, to: 12, transitions: new Set([    {title:      EPS }])},
//             {from: 10, to: 11, transitions: new Set([   {title:      'b' }])},
//             {from: 11, to: 10, transitions: new Set([   {title:      EPS }])},
//             {from: 11, to: 12, transitions: new Set([   {title:      EPS }])},
//             {from: 12, to: 7, transitions: new Set([    {title:      EPS }])},
//
//
//
//
//
//
//             //
//             // {from: 1, to: 3, transitions: new Set([{title: EPS}])},
//             // {from: 2, to: 4, transitions: new Set([{title: '0'}])},
//             // {from: 4, to: 5, transitions: new Set([{title: '1'}])},
//             // {from: 5, to: 6, transitions: new Set([{title: '1'}])},
//             // {from: 3, to: 7, transitions: new Set([{title: '1'}])},
//             // {from: 7, to: 8, transitions: new Set([{title: '0'}])},
//             // {from: 8, to: 9, transitions: new Set([{title: '1'}])},
//             // {from: 9, to: 9, transitions: new Set([{title: '0'}])},
//             // {from: 9, to: 9, transitions: new Set([{title: '1'}])},
//             //
//             // {from: 6, to: 6, transitions: new Set([{title: '0'}])},
//             // {from: 6, to: 6, transitions: new Set([{title: '1'}])},
//         ]
//     }, [{id: 1, isAdmit: false}], ['a', 'b'])
// console.log(nfa.step())
// console.log(nfa.step())
