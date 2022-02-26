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

        console.log('outsoutsoutsoutsoutsouts')
        console.log(outs)
        console.log('outsoutsoutsoutsoutsouts')

        // interface NodeOut { node: NodeCore, out: Output, id: number }

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
        console.log()
        console.log()
        _nodesOuts.forEach((vs) => {
            console.log(vs)
            console.log()
        })


        const _edges = _nodesOuts.reduce((acc: EdgeCore[], vs, index) => {
            const edges = this.edges.filter((edge) => edge.from === this.nodes[index].id)
            console.log('AA', edges)
            edges.forEach((edge) => edge.transitions.forEach((_) => _.forEach(transition => {
            console.log('AA', transition)
                
                vs.forEach((v) => {
                    console.log(v)
                    if (v !== undefined) {
                        console.log('AA', v.id)

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
        // forEach((vs, index) => {

        // })
        _edges.forEach(edge => console.log(edge.from, edge.to, edge.transitions))


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

        console.log(edges)
        edges.forEach(edge => console.log(edge.from, edge.to, edge.transitions))

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
            // _nodesOuts[id].forEach((v) => {
            //     if (v) { 
            //         acc.push(v)
            //     }
            // })  
            return acc
        }, [])

        nodes.forEach((v) => console.log(v))

        return {
            graphcore: { edges, nodes },
            start
        }

        // this.restart()
        // const startStmt = this.curPosition

        // const includes = (x: { node: statement, output: Output }, xs: { node: statement, output: Output }[]): boolean => {
        //     return xs.reduce((acc: boolean, curr) => (curr.node.id === x.node.id && curr.output === x.output) || acc, false)
        // }

        // const createOpenedStmts = (): { node: statement, output: Output, newId: number}[] => {
        //     const openedStmts: { node: statement, output: Output, newId: number }[] = []
        //     this.statements.forEach(_ => {
        //         this.matrix.forEach(vs => {
        //             vs.forEach(v => {
        //                 const tmp: { node: statement, output: Output } = { 
        //                     node: {
        //                         idLogic: v[0].idLogic,
        //                         isAdmit: v[0].isAdmit, 
        //                         output: v[0].output,
        //                         id: v[0].id
        //                     },
        //                     output: v[0].output!
        //                 }
        //                 if (!includes(tmp, openedStmts)) { 
        //                     openedStmts.push({
        //                         node: v[0],
        //                         output: v[0].output!,
        //                         newId: 0
        //                     })
        //                 }
        //             })
        //         } )
        //     })
        //     openedStmts.sort((a, b) => a.node.idLogic - b.node.idLogic)
        //     openedStmts.forEach((stmt, index) => stmt.newId = index)
        //     return openedStmts
        // }

        // const openedStmts = createOpenedStmts()

        // const getOpened = (id: number, output: Output): { node: statement, output: Output, newId: number} => {
        //     const eof = {node: {id: -1, idLogic: -1, isAdmit: false}, newId: -1, output: ""}
        //     const filtred = openedStmts.filter(v => v.node.idLogic === id && v.output === output) 
        //     return filtred.length > 0 ? filtred[0] : eof
        // } 

        // const matrix: { node: statement, output: Output, newId: number}[][] = []
        // openedStmts.forEach(stmt => {
        //     const tmp: { node: statement, output: Output, newId: number}[] = []
        //     this.alphabet.forEach(tr => {
        //         const lookedUp = this.cellMatrix(stmt.node.idLogic, tr)[0]
        //         tmp.push(getOpened(lookedUp.idLogic, lookedUp.output!))
        //     })
        //     matrix.push(tmp)
        // })

        // const nodes = openedStmts.reduce((acc: NodeCore[], stmt) => {
        //     acc.push({
        //         id: stmt.newId,
        //         isAdmit: stmt.node.isAdmit,
        //         output: stmt.output
        //     })
        //     return acc
        // }, [])


        // const matrixNodes = matrix.reduce((acc: NodeCore[][], vs) => {
        //     const tmp: NodeCore[] = []
        //     vs.forEach((v) => {
        //         tmp.push(nodes[v.newId])
        //     })
        //     acc.push(tmp)
        //     return acc
        // }, [])

        // const _edges: EdgeCore[] = []
        // nodes.forEach(node => {
        //     this.alphabet.forEach((tr, letter) => {
        //         _edges.push({
        //             from: node.id, 
        //             to: matrixNodes[node.id][tr].id, 
        //             transitions: new Set<TransitionParams[]>([[{title: letter}]])
        //         })
        //     })
        // })

        // _edges.sort((a, b) => a.from - b.from || a.to - b.to)
        // const edges: EdgeCore[] = []

        // for (let i = 0; i < _edges.length; i++) {
        //     const acc: TransitionParams[] = []
        //     let delta = 0
        //     for (let j = i; j < _edges.length; j++) {
        //         if (_edges[i].from === _edges[j].from && _edges[i].to === _edges[j].to) {
        //             acc.push(Array.from(_edges[j].transitions)[0][0])
        //             delta++
        //         }
        //     }
        //     edges.push({
        //         from: _edges[i].from,
        //         to: _edges[i].to,
        //         transitions: new Set<TransitionParams[]>([acc])
        //     })
        //     i += delta - 1
        // }

        // const startOpened = openedStmts.filter(stmt => stmt.node.idLogic === startStmt[0].stmt.idLogic)[0]
        // const start = nodes[startOpened.newId]

        // return {
        //     graphcore: {
        //         edges: edges,
        //         nodes: nodes
        //     },
        //     start: [start]
        // }
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

let nfa = new Mealy(
    {
        nodes: [
            { id: 0, isAdmit: false },
            { id: 1, isAdmit: false },
            { id: 2, isAdmit: false },
            { id: 3, isAdmit: false },
        ],
        edges: [
            { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
            { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
            { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
            { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
            { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
            { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
            { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },

        ]
    }, [{ id: 0, isAdmit: false }], [])

// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
nfa.mealyToMoore()