import {GraphCore, NodeCore} from "./IGraphTypes";
import {eof, IComputer} from "./IComputer";
import {Edge, elementOfAlphabet, statement, Step} from "./Types";

export class DFA implements IComputer {

    private readonly matrix: statement[][] = []
    private input: elementOfAlphabet[] = []
    private readonly alphabet = new Map()
    private readonly statements = new Map()
    private readonly nodes: NodeCore[]
    private readonly startStatement
    private readonly edges: Edge[] = []
    private currentNode: NodeCore
    private counterSteps: number = 0
    private counterStepsForResult: number = 0

    private getStatementsFromNodes = (nodes: NodeCore[]): void => {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {isAdmit: nodes[i].isAdmit, idLogic: i})
        }
    }

    private getAlphabetFromEdges = (): void => {
        let alphabetSet: Set<string> = new Set()
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue.forEach(value => alphabetSet.add(value))
        }
        let i = 0
        alphabetSet.forEach(value => {
            this.alphabet.set(value, i)
            i++
        })
    }

    private createMatrix = (): void => {
        for (let i = 0; i < this.statements.size; i++) {
            this.matrix[i] = []
            for (let j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = eof
            }
        }
        for (let i = 0; i < this.edges.length; i++) {
            let statementNumberFrom = this.statements.get(this.edges[i].from).idLogic
            //let alphabetSymbolNumber = this.alphabet.get(edges[i].value)
            let statementNumberTo = this.statements.get(this.edges[i].to)
            this.edges[i].localValue
                .forEach(value => this.matrix[statementNumberFrom][this.alphabet.get(value)] = statementNumberTo)
            //console.log(this.statements.get(edges[i].from).idLogic, this.alphabet.get(edges[i].value), '<->', edges[i].value, this.statements.get(edges[i].to))
        }
    }

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        graph.edges
            .sort((a, b) => a.from - b.from)
            .forEach(value => this.edges
                .push({transitions: value.transitions, from: value.from, to: value.to, localValue: []}))

        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue = []
            this.edges[i].transitions
                .forEach(value => this.edges[i].localValue!.push(value))
        }
        //console.log('EDGES: ', this.edges)
        this.getAlphabetFromEdges()
        console.log('ALPHABET: ', this.alphabet)
        this.setInput(input)
        this.getStatementsFromNodes(graph.nodes)
        //console.log('STATEMENTS: ', this.statements)
        this.createMatrix()
        //console.log('MATRIX ', this.matrix)
        this.startStatement = startStatement
        this.currentNode = startStatement
        this.nodes = graph.nodes
        //console.log(this.nodes, this.statements)
    }

    private getCurrentNode = (current: statement) : NodeCore => {
        return this.nodes[current.idLogic]
    }

    private isPossibleTransition = (current: NodeCore, input: string) : boolean => {
        let currentStatement: statement = this.statements.get(current.id)
        let transformedInput: number = this.alphabet.get(input)
        //console.log(!(this.matrix[currentStatement.idLogic][transformedInput] === eof || this.matrix[currentStatement.idLogic][transformedInput] === undefined), this.matrix[currentStatement.idLogic][transformedInput])
        return !(this.matrix[currentStatement.idLogic][transformedInput] === eof
                || this.matrix[currentStatement.idLogic][transformedInput] === undefined)
    }

    // It was need for me for tests
    public getTrendyNode = () : Step => {
        return {node: this.currentNode, counter: this.counterSteps}
    }

    public setInput = (input: string[]): void => {
        this.input = []
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
        })
        this.restart()
    }

    // Get next node by edge symbol. (Nodes for visualization)
    public step = () : Step => {
        if (!this.isPossibleTransition(this.currentNode, this.input[this.counterSteps].value)) {
            return {node: this.currentNode, counter: this.counterSteps}
        }
        let currentStatement: statement = this.statements.get(this.currentNode.id)
        let transformedInput: number = this.alphabet.get(this.input[this.counterSteps].value)
        this.counterSteps++
        this.currentNode = this.nodes[this.matrix[currentStatement.idLogic][transformedInput].idLogic]
        return {node: this.currentNode,
                counter: this.counterSteps}
    }

    // return to initial state
    public restart = () : void => {
        this.currentNode = this.startStatement
        this.counterSteps = 0
    }

    // Get information about admitting in result statement
    public isAdmit = () : Step => {
        this.counterStepsForResult = 0
        let current: statement = this.statements.get(this.startStatement.id)
        let oldCurrent = current
        let l = 0
        let i = current.idLogic
        let j = -1 //now we see at left column of table of def statements
        if (this.alphabet.size < 1) {
            console.log('Alphabet is empty, you should to enter edges')
            return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
        }
        console.log(this.getCurrentNode(current), 'NOW in', 'start statement')
        while (l < this.input.length) {
            j = this.input[l].idLogic
            if (this.matrix[i][j] === eof) {
                console.log(this.getCurrentNode(current), 'FUBAR Aoutomata was stoped in ', current,
                    'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j)
                return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
            }
            oldCurrent = current
            current = this.matrix[i][j]
            this.counterStepsForResult++
            console.log(this.getCurrentNode(current), 'NOW in',  ' ~ ', i, ' ', j)
            i = this.matrix[i][j].idLogic
            l++
        }
        console.log(this.getCurrentNode(current), 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
    }

}
