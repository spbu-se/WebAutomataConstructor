import { History, Edge, elementOfAlphabet, statement, Step, Output } from "./Types";
import { GraphCore, GraphEval, GraphEvalMultiStart, Move, NodeCore, TransitionParams } from "./IGraphTypes";
import { statementCells } from "./PDA";
import { Stack } from "./Stack";
import { node } from "../react-graph-vis-types";

export type statementCell = {
    readonly stackDown?: string
    readonly stackPush?: string[]
    readonly move?: Move
    readonly output?: Output
} & statement

export const eof: statement = { isAdmit: false, idLogic: -1, id: -1 }
export const EPS: string = 'Epsilon'
export const BOTTOM = "Z0"

export abstract class Computer {
    protected input: elementOfAlphabet[] = []
    protected alphabet = new Map()
    protected statements = new Map()
    protected nodes: NodeCore[]
    protected startStatements: NodeCore[] = []
    protected edges: Edge[] = []
    protected currentNode: NodeCore
    protected counterSteps: number = 0
    protected counterStepsForResult: number = 0
    protected historiStep: History[] = []
    protected historiRun: History[] = []
    protected matrix: statementCells[][] = []
    
    public abstract haveEpsilon: () => boolean 
    public abstract restart: () => void
    public abstract run: () => Step
    public abstract step: () => Step
    public abstract setInput: (input: string[]) => void

    public getInput() {
        return this.input
    }

    public getAlphabet() {
        return this.alphabet
    }

    public byEmptyStackAdmt = (isAdmt: boolean): void => {
        throw new Error("PDA attribute")
    }

    public nfaToDfa = (): GraphCore => {
        throw new Error("DFA conversion")
    }

    public minimizeDfa = (): GraphEval => {
        throw new Error("DFA conversion")
    }

    public mooreToMealy = (): GraphEvalMultiStart => {
        throw new Error("Moor conversion")
    }

    public mealyToMoore = (): GraphEvalMultiStart => {
        throw new Error("Moor conversion")
    }

    protected getAlphabetFromEdges(): void {
        let alphabetSet: Set<string> = new Set()
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue.forEach(value => {
                if (value.title !== "") {
                    alphabetSet.add(value.title)
                }
            })
        }
        let i = 0
        alphabetSet.forEach(value => {
            if (value !== "") {
                this.alphabet.set(value, i)
                i++
            }
        })
    }

    protected getStatementsFromNodes(nodes: NodeCore[]): void {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(
                nodes[i].id,
                {
                    id: nodes[i].id,
                    isAdmit: nodes[i].isAdmit,
                    idLogic: i,
                    output: nodes[i].output
                })
        }
    }

    private createMatrix(): void {
        for (let i = 0; i < this.statements.size; i++) {
            this.matrix[i] = []
            for (let j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = []
                //{idLogic: -1, id: -1, isAdmit: false, stackDown: "empty", stackPush: []}
            }
        }
        for (let i = 0; i < this.edges.length; i++) {
            let statementFrom: statement = this.statements.get(this.edges[i].from)
            let statementTo: statement = this.statements.get(this.edges[i].to)
            for (let j = 0; j < this.edges[i].localValue.length; j++) {
                let letterId = this.alphabet.get(this.edges[i].localValue[j].title)
                // if (letterId === undefined) {
                //     throw new Error("A")
                // }
                if (letterId === undefined) {
                    continue
                }
                console.log(letterId)
                console.log(this.edges[i].localValue[j].title)
                let stDwn = this.edges[i].localValue[j].stackDown
                let stPsh = this.edges[i].localValue[j].stackPush
                let mv = this.edges[i].localValue[j].move
                let output = this.edges[i].localValue[j].output === undefined ? statementTo.output : this.edges[i].localValue[j].output
                if (stDwn === undefined || stPsh === undefined || stDwn === "" || stPsh.length === 0) {
                    stDwn = EPS
                    stPsh = [EPS]
                }
                // console.log(statementTo.move)
                this.matrix[statementFrom.idLogic][letterId].push({
                    ...statementTo,
                    stackDown: stDwn,
                    stackPush: stPsh,
                    move: mv,
                    output: output
                })
            }
        }
        this.alphabet.forEach((value, key) => console.log(value, ' ', key))
        this.statements.forEach(value => console.log(value))
        this.matrix.forEach(value => {
            console.log()
            value.forEach(value1 => console.log(value1))
        })
    }

    public cellMatrix(i: number, j: number): statementCell[] {
        return this.matrix[i][j]
    }

    public getCurrNode = (): number => {
        return this.currentNode.id
    }

    protected constructor(graph: GraphCore, startStatements: NodeCore[]) {

        graph.edges
            .sort((a, b) => a.from - b.from)
            .forEach(value => this.edges.push({
                transitions: value.transitions === undefined ? new Set<TransitionParams[]>([[{ title: "" }]]) : value.transitions,
                from: value.from,
                to: value.to,
                localValue: [],
            }))

        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue = []
            this.edges[i].transitions.forEach(value =>
                value.forEach(value1 => this.edges[i].localValue!.push(value1))
            )
        }

        this.getAlphabetFromEdges()
        this.getStatementsFromNodes(graph.nodes)
        this.startStatements = startStatements
        this.currentNode = startStatements[0]
        this.nodes = graph.nodes
        this.createMatrix()
    }

    public getStartStatements = (): NodeCore[] => {
        return this.startStatements
    }
}