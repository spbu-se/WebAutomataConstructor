import { NonDeterministic } from "./Exceptions";
import { EdgeCore, GraphCore, GraphEval, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { Moore } from "./Moore";
import { OutputAutomata } from "./OutputAutomata";
import { Edge, Step } from "./Types";

export class DMoore extends Moore {
    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements, input)
    }

    step = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.oaStep()
    }

    run = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.oaRun()
    }
}
let nfa = new DMoore(
    {
        nodes: [
            { id: 0, isAdmit: false,  },
            { id: 1, isAdmit: false,   },
            { id: 2, isAdmit: false,   },
            // { id: 3, isAdmit: false, output: '3' },
        ],
        edges: [
            { from: 0, to: 0, transitions: new Set([[{ title: '1' }]]) },
            { from: 0, to: 1, transitions: new Set([[{ title: '1' }]]) },

            // { from: 1, to: 1, transitions: new Set([[{ title: '0' }]]) },
            // { from: 1, to: 2, transitions: new Set([[{ title: '1' }]]) },

            // { from: 2, to: 1, transitions: new Set([[{ title: '0' }]]) },
            // { from: 2, to: 0, transitions: new Set([[{ title: '1' }]]) },
        ]
    }, [{ id: 0, isAdmit: false }], [])
console.log(nfa.isDeterministic())
