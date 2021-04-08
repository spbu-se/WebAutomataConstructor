import {Edge, elementOfAlphabet, statement, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";

export const eof: statement = {isAdmit: false, idLogic: -1, id: -1}
export const EPS: string = 'Epsilon'

export abstract class Computer {

    protected input: elementOfAlphabet[] = []
    protected alphabet = new Map()
    protected statements = new Map()
    protected nodes: NodeCore[]
    protected startStatement
    protected edges: Edge[] = []
    protected currentNode: NodeCore
    protected counterSteps: number = 0
    protected counterStepsForResult: number = 0
    protected alphabetDBG: any = []
    protected haveEpsilon: boolean = false
    protected alphabetSize: number = 0;

    public abstract restart(): void
    public abstract run(): Step
    public abstract step(): Step

    protected getAlphabetFromEdges(): void {
        let alphabetSet: Set<string> = new Set()
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue.forEach(value => {
                if (value === 'Epsilon') {
                    this.haveEpsilon = true
                }
                alphabetSet.add(value)
            })
        }
        let i = 0
        alphabetSet.forEach(value => {
            this.alphabet.set(value, i)
            this.alphabetDBG.push(value)
            i++
        })
    }

    protected getStatementsFromNodes(nodes: NodeCore[]): void {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {isAdmit: nodes[i].isAdmit, idLogic: i})
        }
    }

    protected constructor(graph: GraphCore, startStatement: NodeCore) {
        graph.edges
            .sort((a, b) => a.from - b.from)
            .forEach(value => this.edges
                .push({transitions: value.transitions, from: value.from, to: value.to, localValue: []}))

        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue = []
            this.edges[i].transitions
                .forEach(value => this.edges[i].localValue!.push(value))
        }
     //   console.log('EDGES: ', this.edges)
        this.getAlphabetFromEdges()
        if (this.haveEpsilon) {
            this.alphabetSize = this.alphabet.size - 1
        } else {
            this.alphabetSize = this.alphabet.size
        }
        console.log('ALPHABET: ', this.alphabet)
        this.getStatementsFromNodes(graph.nodes)
    //    console.log('STATEMENTS: ', this.statements)

        this.startStatement = startStatement
        this.currentNode = startStatement
        this.nodes = graph.nodes
    }



}