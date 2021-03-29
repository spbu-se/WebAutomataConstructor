import {Edge, elementOfAlphabet, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";

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

    protected  alphabetDBG: any = []

    public abstract restart: () => void
   // public abstract run: () => Step
    public abstract step: (input: string) => Step

    protected getAlphabetFromEdges = (): void => {
        let alphabetSet: Set<string> = new Set()
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue.forEach(value => alphabetSet.add(value))
        }
        let i = 0
        alphabetSet.forEach(value => {
            this.alphabet.set(value, i)
            this.alphabetDBG.push(value)
            i++
        })
    }

    protected getStatementsFromNodes = (nodes: NodeCore[]): void => {
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
  //      console.log('ALPHABET: ', this.alphabet)
        this.getStatementsFromNodes(graph.nodes)
    //    console.log('STATEMENTS: ', this.statements)

        this.startStatement = startStatement
        this.currentNode = startStatement
        this.nodes = graph.nodes
    }



}