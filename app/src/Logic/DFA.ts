import {GraphCore, NodeCore} from "./IGraphTypes";
import {NFA} from "./NFA";
import {Step} from "./Types";

export class DFA extends NFA {
    private nfa: NFA
    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement, input)
        this.nfa = new NFA(graph, startStatement, input)
        this.setInput(input)
        if (this.nfa.run().nodes.length > 1) {
            throw new Error("Is not determenistic")
        }
    }

}
let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}

let testFunc = (nfa: NFA) : Step => {
    for (let i = 0; i < nfa.input.length; i++) {
        nfa.step()
    }
    return nfa.getTrendyNode()
}


    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, transitions: toSet(['0', '1'])},
                {from: 1, to: 2, transitions: toSet(['0'])},
                {from: 2, to: 3, transitions: toSet(['0'])}
            ]
        }, {id: 1, isAdmit: false}, ['0'])

