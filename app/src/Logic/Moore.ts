import { node } from "../react-graph-vis-types";
import { EdgeCore, GraphCore, GraphEval, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { OutputAutomata } from "./OutputAutomata";
import { Edge, Step } from "./Types";

export class Moore extends OutputAutomata {
    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements, input)
    }

    public restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
        })
    }

    public mooreToMealy = (): GraphEvalMultiStart => {
        const mapNodes: Map<number, NodeCore> = new Map()
        this.nodes.forEach(node => mapNodes.set(node.id, { id: node.id, isAdmit: node.isAdmit, output: node.output }))
        const mealyEdges: EdgeCore[] = this.edges.map((edge: Edge) => {
            const tmpTransitions: Set<TransitionParams[]> = new Set()
            const tmpTransiton: TransitionParams[] = []
            edge.transitions.forEach(v => v.forEach(transition => {
                tmpTransiton.push({ title: transition.title, output: mapNodes.get(edge.to)?.output })
            }))
            tmpTransitions.add(tmpTransiton)

            return { from: edge.from, to: edge.to, transitions: tmpTransitions }
        })
        console.log('>>>>', this.startStatements)
        return {
            graphcore: { edges: mealyEdges, nodes: this.nodes.map(node => ({ id: node.id, isAdmit: node.isAdmit })) },
            start: this.startStatements.map(statement => ({ id: statement.id, isAdmit: statement.isAdmit }))
        }
    }

    step = this.oaStep


    run = this.oaRun
}
