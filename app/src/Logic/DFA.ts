import {GraphCore, NodeCore} from "./IGraphTypes";
import {NFA} from "./NFA";

export class DFA extends NFA {

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement, input)
        this.setInput(input)
        if (super.run().nodes.length > 1) {
            throw new Error("Is not determenistic")
        }
    }

}
