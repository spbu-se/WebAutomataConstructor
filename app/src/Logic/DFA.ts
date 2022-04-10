import { GraphCore, NodeCore } from "./IGraphTypes";
import { EpsilonNFA } from "./EpsilonNFA";
import { Step } from "./Types";
import { NonDeterministic } from "./Exceptions";

export class DFA extends EpsilonNFA {
    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        this.setInput(input)
    }

    step = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.enfaStep()
    }

    run = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.enfaRun()
    }
}


let nfa = new DFA (
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: true},
            ],
            edges: [
    
                {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
                {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
            ]
        }, [{id: 1, isAdmit: false}], [],
    )
// nfa.

// let nfa = new DFA (
//     {
//         nodes: [
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: true},
//
//
//             // {id: 1, isAdmit: false},
//             // {id: 2, isAdmit: true},
//             // {id: 3, isAdmit: false},
//             // {id: 4, isAdmit: true},
//             // {id: 5, isAdmit: true},
//             // {id: 6, isAdmit: false},
//
//             // {id: 0, isAdmit: false},
//             // {id: 1, isAdmit: false},
//             // {id: 2, isAdmit: false},
//             // {id: 3, isAdmit: false},
//             // {id: 4, isAdmit: true},
//             // {id: 5, isAdmit: true},
//             // {id: 6, isAdmit: false},
//
//
//         ],
//         edges: [
//
//             {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
//
//             //youtube
//             // {from: 1, to: 5, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 1, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 2, to: 6, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 2, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 3, to: 6, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 3, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 4, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 4, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 5, to: 2, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 5, to: 3, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 6, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 6, to: 3, transitions: new Set([ [{title: 'b'}] ])},
//
//
//             // {from: 0, to: 1, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 0, to: 3, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 1, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 1, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 2, to: 2, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 2, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 5, to: 5, transitions: new Set([ [{title: '0'}, {title: '1'}] ])},
//             // {from: 3, to: 0, transitions: new Set([ [{title: '0'}] ])},
//             // {from: 3, to: 4, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 4, to: 5, transitions: new Set([ [{title: '1'}] ])},
//             // {from: 4, to: 2, transitions: new Set([ [{title: '0'}] ])},
//
//             //refference
//             // {from: 0, to: 1, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 0, to: 2, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 1, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 1, to: 4, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 2, to: 3, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 2, to: 5, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 3, to: 3, transitions: new Set([ [{title: 'a'}, {title: 'b'}] ])},
//             // {from: 4, to: 4, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 4, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 5, to: 5, transitions: new Set([ [{title: 'a'}] ])},
//             // {from: 5, to: 6, transitions: new Set([ [{title: 'b'}] ])},
//             // {from: 6, to: 6, transitions: new Set([ [{title: 'a'}, {title: 'b'}] ])},
//
//         ]
//     }, [{id: 1, isAdmit: false}], [],
// )
// console.log(nfa.minimizeDfa().start)