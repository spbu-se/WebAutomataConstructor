import {GraphCore, NodeCore} from "./IGraphTypes";
import {EpsilonNFA} from "./EpsilonNFA";

export class NFA extends EpsilonNFA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        if (this.haveEpsilon()) {
            throw new Error('Epsilon Transitions')
        }
    }

}
//
// let nfa = new NFA (
//     {
//         nodes: [
//             {id: 0, isAdmit: false},
//             {id: 1, isAdmit: false},
//             {id: 2, isAdmit: false},
//
//         ],
//         edges: [
//             {from: 0, to: 0, transitions: new Set([ [{title: '0'}] ])},
//             {from: 0, to: 1, transitions: new Set([ [{title: '0'}] ])},
//             {from: 1, to: 2, transitions: new Set([ [{title: '1'}] ])},
//         ]
//     }, [{id: 0, isAdmit: false}], [],
// )
// nfa.nfaToDfa()

// nfa.nfaToDfa().nodes.forEach((v) => console.log(v.id))
// nfa.nfaToDfa().edges.forEach((v) => console.log(v.from, v.to))