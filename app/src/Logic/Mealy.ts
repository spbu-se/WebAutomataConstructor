import { Computer } from "./Computer";
import { GraphCore, NodeCore } from "./IGraphTypes";
import { OutputAutomata } from "./OutputAutomata";

export class Mealy extends OutputAutomata {
    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements, input)
    }

}


// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 0, isAdmit: false },
//             { id: 1, isAdmit: false },
//             { id: 2, isAdmit: false },
//             { id: 3, isAdmit: false },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
//             { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },
        
//         ]
//     }, [{ id: 0, isAdmit: false }], ["10", "10"])

// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())