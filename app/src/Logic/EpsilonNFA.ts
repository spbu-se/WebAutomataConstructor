import {History, statement, statementNfa, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {Computer, eof, EPS} from "./Computer";
import {PDA} from "./PDA";

export class EpsilonNFA extends PDA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)

    }

    step = (): Step => {
        let ret = this._step
        (
            this.counterSteps,
            this.alphabet.get(this.input[this.counterSteps].value),
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

}

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
//             {from: 1, to: 8, transitions: new Set([     {title:      EPS}])},
//             {from: 2, to: 3, transitions: new Set([     {title:      EPS}])},
//             {from: 2, to: 9, transitions: new Set([     {title:      EPS}])},
//             {from: 3, to: 4, transitions: new Set([     {title:      EPS}])},
//             {from: 3, to: 6, transitions: new Set([     {title:      EPS}])},
//             {from: 4, to: 5, transitions: new Set([     {title:      'a'}])},
//             {from: 5, to: 4, transitions: new Set([     {title:      EPS}])},
//             {from: 5, to: 6, transitions: new Set([     {title:      EPS}])},
//             {from: 6, to: 7, transitions: new Set([     {title:      EPS}])},
//             {from: 7, to: 2, transitions: new Set([     {title:      EPS}])},
//             {from: 7, to: 8, transitions: new Set([     {title:      EPS}])},
//             {from: 9, to: 10, transitions: new Set([    {title:      EPS}])},
//             {from: 9, to: 12, transitions: new Set([    {title:      EPS}])},
//             {from: 10, to: 11, transitions: new Set([   {title:      'b'}])},
//             {from: 11, to: 10, transitions: new Set([   {title:      EPS}])},
//             {from: 11, to: 12, transitions: new Set([   {title:      EPS}])},
//             {from: 12, to: 7, transitions: new Set([    {title:      EPS}])},
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
