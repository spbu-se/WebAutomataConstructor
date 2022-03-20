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
        return this.oaRun()
    }

    run = (): Step => {
        if (!super.isDeterministic()) {
            throw new NonDeterministic()
        }
        return this.oaRun()
    }
}
