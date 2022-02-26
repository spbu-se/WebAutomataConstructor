import { Interface } from "readline";
import { edge } from "../react-graph-vis-types";
import { Computer, statementCell } from "./Computer";
import { EdgeCore, GraphCore, GraphEvalMultiStart, NodeCore, TransitionParams } from "./IGraphTypes";
import { OutputAutomata } from "./OutputAutomata";
import { Output, position, statement } from "./Types";

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

        const nodesOuts = () => {
            let counter = 0
            return this.nodes.reduce((acc: (NodeCore | undefined)[][], node: NodeCore) => {
                const edges = this.edges.filter((edge) => edge.to === node.id)

                const tmp: (NodeCore | undefined)[] = []
                outs.forEach(() => tmp.push(undefined))

                edges.forEach((edge) => {
                    edge.transitions.forEach((_) => _.forEach((transition) => {
                        const out = transition.output!
                        const outIndex = outs.get(out)!
                        if (!tmp[outIndex]) {
                            tmp[outIndex] = { 
                                id: counter,
                                isAdmit: node.isAdmit,
                                output: out 
                            }
                            counter++
                        }
                    }))
                })
                
                if (tmp.filter((v) => v !== undefined).length === 0) {
                    tmp[0] = {
                        id: counter,
                        isAdmit: node.isAdmit,
                        output: "~" 
                    }
                    counter++
                }

                acc.push(tmp)

                return acc
            }, [])
        }

        const _nodesOuts = nodesOuts() 

        const _edges = _nodesOuts.reduce((acc: EdgeCore[], vs, index) => {
            const edges = this.edges.filter((edge) => edge.from === this.nodes[index].id)
            edges.forEach((edge) => edge.transitions.forEach((_) => _.forEach(transition => {
                vs.forEach((v) => {
                    console.log(v)
                    if (v !== undefined) {
                        acc.push({
                            from: v.id,
                            to: _nodesOuts[edge.to][outs.get(transition.output!)!]!.id,
                            transitions: new Set<TransitionParams[]>([[{ title: transition.title }]])
                        })
                    }
                })
                
            })))
            return acc
        },[])

        const edges: EdgeCore[] = []
        _edges.sort((a, b) => a.from - b.from || a.to - b.to)
        for (let i = 0; i < _edges.length; i++) {
            const acc: TransitionParams[] = []
            let delta = 0
            for (let j = i; j < _edges.length; j++) {
                if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
                    acc.push(Array.from(_edges[j].transitions)[0][0])
                    delta++
                }
            }
            edges.push({
                from: _edges[i].from,
                to: _edges[i].to,
                transitions: new Set<TransitionParams[]>([acc])
            })
            i += delta - 1
        }

        const starts = this.startStatements.map((stmt) => stmt.id)

        const nodes = _nodesOuts.reduce((acc: NodeCore[], vs, index) => {
            vs.forEach((v) => {
                if (v) {
                    acc.push(v)
                }
            })
            return acc
        }, [])

        const start = starts.reduce((acc: NodeCore[], id) => {
            const curNodeOuts = _nodesOuts[id].filter((v) => {
                if (v !== undefined) {
                    return v
                }
            })
            acc.push(curNodeOuts[0]!)
            return acc
        }, [])

        return {
            graphcore: { edges, nodes },
            start
        }
    }
}


// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 1, isAdmit: false },
//             { id: 2, isAdmit: false },
//             { id: 3, isAdmit: false },
//             { id: 4, isAdmit: false },
//         ],
//         edges: [
//             { from: 1, to: 1, transitions: new Set([[{ title: 'a', output: '1' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },

//             { from: 2, to: 4, transitions: new Set([[{ title: 'a', output: '1' }, { title: 'b', output: '1' }]]) },
//             // { from: 2, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },

//             { from: 3, to: 3, transitions: new Set([[{ title: 'b', output: '1' }]]) },
//             { from: 3, to: 2, transitions: new Set([[{ title: 'a', output: '1' }]]) },

//             { from: 4, to: 1, transitions: new Set([[{ title: 'b', output: '1' }]]) },
//             { from: 4, to:3, transitions: new Set([[{ title: 'a', output: '0' }]]) },

//         ]
//     }, [{ id: 1, isAdmit: false }], [])

// console.log(nfa.mealyToMoore().graphcore.edges)

// let nfa = new Mealy(
//     {
//         nodes: [
//             { id: 0, isAdmit: false },
//             { id: 1, isAdmit: false },
//             { id: 2, isAdmit: false },
//             { id: 3, isAdmit: false },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
//             { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
//             { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
//             { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },

//         ]
//     }, [{ id: 0, isAdmit: false }], [])

// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
// nfa.mealyToMoore()