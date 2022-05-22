import { Interface } from "readline";
import { edge } from "../react-graph-vis-types";
import { Computer, statementCell } from "./Computer";
// import {NonDeterministic} from "./Exceptions";
import { EdgeCore, GraphCore, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { OutputAutomata } from "./OutputAutomata";
import { Output, position, statement, Step } from "./Types";

export class Mealy extends OutputAutomata {
    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements, input)
    }

    public mealyToMoore = (): GraphEvalMultiStart => {
        const outs: Map<Output, number> = new Map()
        this.edges.forEach((edge) => {
            edge.transitions.forEach((_) => _.forEach((transition) => {
                const out = transition.output!
                if (!outs.has(out)) {
                    outs.set(out, outs.size)
                }
            }))
        })

        const outNumbs: Output[] = []
        outs.forEach((v, k) => outNumbs.push(k))

        console.log(outs)
        console.log(outNumbs)

        type outEdge = {
            from: number,
            to: number,
            title: string,
            output: Output
        }

        const diffEdges = this.edges.reduce(((acc, edge) => {
            const tmp: outEdge[] = []

            edge.transitions.forEach((t) => t.forEach((v) => tmp.push({
                from: edge.from,
                to: edge.to,
                title: v.title,
                output: v.output ? v.output : ''
            })))

            tmp.forEach((v) => acc.push(v))

            return acc
        }), new Array<outEdge>())


        const toOuts = new Map<number, number[]>()
        this.nodes.forEach((v) =>
            toOuts.set(v.id, new Array<number>(outs.size).fill(-1)))
        let count = 1;
        diffEdges.forEach((edge) => {
            if (toOuts.get(edge.to) === undefined) {
                throw new Error("Mealy to Moore");
            } else {
                if (toOuts.get(edge.to)![outs.get(edge.output)!] === -1) {
                    toOuts.get(edge.to)![outs.get(edge.output)!] = count
                    count++
                }
            }
        })

        const nodesMoore: NodeCore[] = []
        toOuts.forEach((v, key) => v
            .map((v, k) => ({value: v, out: outNumbs[k]}))
            .filter((v) => v.value !== -1)
            .forEach((v) => {

                nodesMoore.push({
                    ...this.nodes.find((node) => node.id === key)!,
                    id: v.value,
                    output: v.out
                })
            })
        )

        type mooreEdge = {
            from: number,
            to: number,
            title: string,
        }

        const outEdges = diffEdges.reduce((acc, v) => {
            if (toOuts.get(v.from) === undefined) {
                throw new Error("Mealy to Moore");
            } else {
                const mooreIds = toOuts.get(v.from)!.filter((id) => id !== -1)
                mooreIds.forEach((id) => {
                    const idLetter = outs.get(v.output)!
                    acc.push({
                        from: id,
                        to: toOuts.get(v.to)![idLetter],
                        title: v.title
                    })
                })
                return acc
            }
        }, new Array<mooreEdge>())

        const startNodes = this.startStatements.map(v => this.nodes[v.id])

        const startMoore: NodeCore[] = []
        startNodes.forEach((v) =>
            toOuts.get(v.id)?.filter((v) => v !== -1)
                .forEach((v) => startMoore.push(nodesMoore.find((node) => node.id === v)!)))

        const edgesMoore: EdgeCore[] = []
        outEdges.sort((a, b) => a.from - b.from || a.to - b.to)

        for (let i = 0; i < outEdges.length; i++) {
            const acc: TransitionParams[] = []
            let delta = 0
            let j = i
            while (j < outEdges.length && outEdges[i].from === outEdges[j].from && outEdges[i].to === outEdges[j].to) {
                acc.push({ title: outEdges[j].title })

                j++
            }
            i = j - 1

            edgesMoore.push({
                from: outEdges[i].from,
                to: outEdges[i].to,
                transitions: new Set<TransitionParams[]>([acc])
            })

        }


        return {
            graphcore: { edges: edgesMoore, nodes: nodesMoore },
            start: startMoore
        }
    }

    step = this.oaStep

    run = this.oaRun

}
