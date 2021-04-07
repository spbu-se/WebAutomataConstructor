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
