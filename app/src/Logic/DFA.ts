import {GraphCore, NodeCore} from "./IGraphTypes";
import {EpsilonNFA} from "./EpsilonNFA";

export class DFA extends EpsilonNFA {

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement, input)
        this.setInput(input)
        if (!super.isDeterministic()) {
            throw new Error("Is not determenistic")
        }
    }

}
