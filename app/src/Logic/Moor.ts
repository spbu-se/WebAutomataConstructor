import { node } from "../react-graph-vis-types";
import { EdgeCore, GraphCore, GraphEval, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { OutputAutomata } from "./OutputAutomata";
import { Edge } from "./Types";

export class Moor extends OutputAutomata {
    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements, input)
    }

    public moorToMealy = (): GraphEvalMultiStart => {
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
        return {
            graphcore: { edges: mealyEdges, nodes: this.nodes.map(node => ({ id: node.id, isAdmit: node.isAdmit })) },
            start: this.startStatements.map(statement => ({ id: statement.id, isAdmit: statement.isAdmit }))
        }
    }
}


let nfa = new Moor(
    {
        nodes: [
            { id: 0, isAdmit: false, output: '0' },
            { id: 1, isAdmit: false, output: '1' },
            { id: 2, isAdmit: false, output: '2' },
            { id: 3, isAdmit: false, output: '3' },
        ],
        edges: [
            { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
            { from: 1, to: 2, transitions: new Set([[{ title: '10' }]]) },
            { from: 2, to: 3, transitions: new Set([[{ title: '10' }]]) },
            { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },

        ]
    }, [{ id: 0, isAdmit: false }], ["5"])

// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
const conv = nfa.moorToMealy()
conv.graphcore.edges.forEach(edge => {
    console.log(edge.from)
    console.log(edge.to)
    console.log(edge.transitions)
})
conv.graphcore.nodes.forEach(node => {
    console.log(node)
})