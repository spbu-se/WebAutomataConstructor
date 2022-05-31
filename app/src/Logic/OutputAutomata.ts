import { Computer, EPS } from "./Computer";
import { GraphCore, NodeCore } from "./IGraphTypes";
import { Output, position, Step, History, HistTrace } from "./Types";

export abstract class OutputAutomata extends Computer {
    protected curPosition: position[]

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
        this.matrix.forEach(value => {
            console.log()
            value.forEach(value1 => console.log(value1))
        })
    }

    isDeterministic(): boolean {
        let ret = true
        this.matrix.forEach((line) => line.forEach((cells) => {
            const fstCell = cells[0]
            const hasDublicates = cells.reduce((acc, stmt) => acc || (stmt.stackDown === fstCell.stackDown), false)

            if (cells.length > 1 && hasDublicates) {
                ret = false
            }
        }))
        return ret
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined

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

    oaRun = (): Step => {
        const histTrace: HistTrace[] = []
        
        this.historiRun = []
        this.counterStepsForResult = 0

        let output
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun 
            }
            const after = this._step(ref, histTrace)
            this.counterStepsForResult = ref.counterSteps
            console.log(this.counterStepsForResult)
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            output = after.output
        }
        
        return { 
            counter: this.counterStepsForResult, 
            history: this.historiRun, 
            isAdmit: this.haveAdmitting(this.curPosition), 
            nodes: this.toNodes(this.curPosition),
            output: output,
            histTrace
        }
    }

    protected toNodes(positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            let temp: NodeCore = {
                ...this.nodes[value.stmt.idLogic],
                from: value.from,
                cur: value.cur,
                by: value.by,
                output: value.output,
                stack: value.stack === undefined ? undefined : value.stack.getStorage()
            }
            retNodes.push(temp)
        })
        return retNodes
    }

    protected haveAdmitting(positions: position[]): boolean {
        return positions.reduce((acc: boolean, p) => acc && p.stmt.isAdmit, true)
    }

    protected nextStepPosition = (position: position, by: number): { position: position, output: Output | undefined }[] => {
        return this.cellMatrix(position.stmt.idLogic, by).map(v => {
            const getLetter = (id: number): any => {
                let ret
                this.alphabet.forEach((v, k) => {
                    if (id === v) {
                        ret = k
                    }
                })
                return ret
            }
    
            const ret: position = { 
                stmt: v, 
                by: getLetter(by), 
                cur: this.nodes[v.idLogic], 
                from: this.nodes[position.stmt.idLogic]
            }
            return ({ position: ret, output: v.output })
        })
    }

    protected nextStepPositions = (positions: position[], by: number): { positions: position[], outputs: Output[] } => {
        const nextPOs = positions.map((v) => this.nextStepPosition(v, by))
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
        nextPs.forEach((v, index) => v.output = nextOs[index])
        return { positions: nextPs, outputs: nextOs }
    }

    protected _step = (ref: { counterSteps: number, curPosition: position[], historiStep: History[] }, histTrace: HistTrace[]) => {
        const byLetter: NodeCore[] = []
        
        const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
        const nextPositions = this.nextStepPositions(ref.curPosition, trNum)
        
        ref.curPosition = nextPositions.positions
        
        const nodesOfCurPos: NodeCore[] = this.toNodes(ref.curPosition)
        nodesOfCurPos.forEach((node) => byLetter.push(node))
        
        ref.historiStep.push({ nodes: nodesOfCurPos, by: trNum })
        if (ref.curPosition.length > 0) {
            ref.counterSteps++
        }

        console.log('--->byLetter')
        console.log(byLetter)
        console.log('--->byLetter')
        
        histTrace.push({ byLetter })


        return {
            counter: ref.counterSteps,
            history: ref.historiStep,
            isAdmit: this.haveAdmitting(ref.curPosition),
            nodes: nodesOfCurPos,
            output: nextPositions.outputs,
            byLetter,
            histTrace
        }
    }

    oaStep = (): Step => {
        const ref = { 
            counterSteps: this.counterSteps,
            curPosition: this.curPosition, 
            historiStep: this.historiStep 
        }
        const after = this._step(ref, [])
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep

        return {
            counter: after.counter,
            history: after.history,
            isAdmit: after.isAdmit,
            nodes: after.nodes,
            output: after.output,
            byLetter: after.byLetter
        }
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({ idLogic: this.alphabet.get(value), value: value })
        })
        this.restart()
    }

}
