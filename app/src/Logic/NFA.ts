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