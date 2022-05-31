import { node } from "../react-graph-vis-types";
import { NonDeterministic } from "./Exceptions";
import { EdgeCore, GraphCore, GraphEval, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { Mealy } from "./Mealy";
import { Step } from "./Types";

export class DMealy extends Mealy {
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