import { Computer } from "./Computer";
import { GraphCore, NodeCore } from "./IGraphTypes";
import { Output, position, Step, History } from "./Types";

export class Mealy extends Computer {
    private curPosition: position[]

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements)

        this.curPosition = []
        startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
        })
        this.setInput(input)
        this.counterSteps = 0

        console.log("ALPHBT")
        this.alphabet.forEach((value, key) => console.log(value, key))
        console.log("STMTS")
        this.statements.forEach(value => console.log(value))
        console.log(this.curPosition)
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

    public run = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0
        let output
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun 
            }
            const after = this._step(ref)
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            output = after.output
        }
        
        return { 
            counter: this.counterStepsForResult, 
            history: this.historiRun, 
            isAdmit: this.haveAdmitting(this.curPosition), 
            nodes: this.toNodes(this.curPosition),
            output: output 
        }
    }

    private toNodes(positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            let temp: NodeCore = {
                ...this.nodes[value.stmt.idLogic],
                stack: value.stack === undefined ? undefined : value.stack.getStorage()
            }
            retNodes.push(temp)
        })
        return retNodes
    }

    protected haveAdmitting(positions: position[]): boolean {
        return positions.reduce((acc, p) => acc && p.stmt.isAdmit, true)
    }

    private _step = (ref: { counterSteps: number, curPosition: position[], historiStep: History[] }) => {
        const nextStepPosition = (position: position, by: number): { position: position, output: Output | undefined }[] => {
            return this.cellMatrix(position.stmt.idLogic, by).map(v => ({ position: { stmt: v }, output: v.output }))
        }

        const nextStepPositions = (positions: position[], by: number): { positions: position[], outputs: Output[] } => {
            const nextPOs = positions.map((v) => nextStepPosition(v, by))
            const nextPs = nextPOs.reduce((acc: position[], pos) => {
                pos.forEach(po => acc.push(po.position))
                return acc
            }, [])
            const nextOs = nextPOs.reduce((acc: Output[], pos) => {
                pos.forEach(po => {
                    if (po.output === undefined) {
                        throw new Error("Output undefinded")
                    }
                    acc.push(po.output)
                })
                return acc
            }, [])
            return { positions: nextPs, outputs: nextOs }
        }

        const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
        const nextPositions = nextStepPositions(ref.curPosition, trNum)

        if (nextPositions.positions.length > 0) {
            ref.curPosition = nextPositions.positions
            const nodesOfCurPos: NodeCore[] = this.toNodes(ref.curPosition)
            ref.historiStep.push({ nodes: nodesOfCurPos, by: trNum })
            ref.counterSteps++

            return {
                counter: ref.counterSteps,
                history: ref.historiStep,
                isAdmit: this.haveAdmitting(ref.curPosition),
                nodes: nodesOfCurPos,
                output: nextPositions.outputs
            }
        }
        
        return {
            counter: ref.counterSteps,
            history: ref.historiStep,
            isAdmit: this.haveAdmitting(ref.curPosition),
            nodes: this.toNodes(ref.curPosition),
            output: nextPositions.outputs
        }
    }

    public step = (): Step => {
        const ref = { counterSteps: this.counterSteps, curPosition: this.curPosition, historiStep: this.historiStep }
        const after = this._step(ref)
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep

        return {
            counter: after.counter,
            history: after.history,
            isAdmit: after.isAdmit,
            nodes: after.nodes,
            output: after.output
        }

        // const nextStepPosition = (position: position, by: number): { position: position, output: Output | undefined }[] => {
        //     return this.cellMatrix(position.stmt.idLogic, by).map(v => ({ position: { stmt: v }, output: v.output }))
        // }

        // const nextStepPositions = (positions: position[], by: number): { positions: position[], outputs: Output[] } => {
        //     const nextPOs = positions.map((v) => nextStepPosition(v, by))
        //     const nextPs = nextPOs.reduce((acc: position[], pos) => {
        //         pos.forEach(po => acc.push(po.position))
        //         return acc
        //     }, [])
        //     const nextOs = nextPOs.reduce((acc: Output[], pos) => {
        //         pos.forEach(po => {
        //             if (po.output === undefined) {
        //                 throw new Error("Output undefinded")
        //             }
        //             acc.push(po.output)
        //         })
        //         return acc
        //     }, [])
        //     return { positions: nextPs, outputs: nextOs }
        // }

        // const trNum = this.alphabet.get(this.input[this.counterSteps]?.value)
        // const nextPositions = nextStepPositions(this.curPosition, trNum)
        // this.curPosition = nextPositions.positions
        // const nodesOfCurPos = this.toNodes(this.curPosition)
        // this.historiStep.push({ nodes: nodesOfCurPos, by: trNum })
        // this.counterSteps++

        // return {
        //     counter: this.counterSteps,
        //     history: this.historiStep,
        //     isAdmit: this.haveAdmitting(this.curPosition),
        //     nodes:  nodesOfCurPos,
        //     output: nextPositions.outputs 
        // }
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({ idLogic: this.alphabet.get(value), value: value })
        })
        this.restart()
    }

}


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
    }, [{ id: 0, isAdmit: false }], ["10", "10"])

console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())