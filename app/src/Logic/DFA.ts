import {edgeCore, graphCore, nodeCore} from "./IGraphTypes";

export interface statement extends nodeCore {
    idLogic: number
}
export type elementOfAlphabet = {
    value: string
    idLogic: number
}

export const eof: statement = { isAdmit: false, idLogic: -1, id: -1}

export class DFA {

    private readonly matrix: statement[][] = []
    private readonly input: elementOfAlphabet[] = []
    private readonly alphabet = new Map()
    private readonly statements = new Map()
    private readonly nodes: nodeCore[]
    private readonly startStatement

    private getStatementsFromNodes = (nodes: nodeCore[]) : void => {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {isAdmit: nodes[i].isAdmit, idLogic: i})
        }
    }

    private getAlphabetFromEdges = (edges: edgeCore[]) : void => {
        let alphabetSet: Set<string> = new Set
        for (let i = 0; i < edges.length; i++) {
            edges[i].value.forEach(value => alphabetSet.add(value))
        }
        let i = 0
        alphabetSet.forEach(value => {
            this.alphabet.set(value, i)
            i++
        })
    }

    private createMatrix = (edges: edgeCore[]) : void => {
        for (let i = 0; i < this.statements.size; i++) {
            this.matrix[i] = []
            for (let j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = eof
            }
        }
        for (let i = 0; i < edges.length; i++) {
            let statementNumberFrom = this.statements.get(edges[i].from).idLogic
            //let alphabetSymbolNumber = this.alphabet.get(edges[i].value)
            let statementNumberTo = this.statements.get(edges[i].to)
            edges[i].value.forEach(value => this.matrix[statementNumberFrom][this.alphabet.get(value)] = statementNumberTo)
            //console.log(this.statements.get(edges[i].from).idLogic, this.alphabet.get(edges[i].value), '<->', edges[i].value, this.statements.get(edges[i].to))
        }
    }

    private getTransformedInput = (input: string[]) : void => {
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
            //console.log(value, this.alphabet.get(value))
        })
    }

    constructor(graph: graphCore, startStatement: nodeCore, input: string[]) {
        let edges = graph.edges.sort((a, b) => a.from - b.from)
        //console.log('EDGES: ', edges)
        this.getAlphabetFromEdges(edges)
        //console.log('ALPHABET: ', this.alphabet)
        this.getTransformedInput(input)
        this.getStatementsFromNodes(graph.nodes)
        //console.log('STATEMENTS: ', this.statements)
        this.createMatrix(edges)
        //console.log('MATRIX ', this.matrix)
        this.startStatement = startStatement
        this.nodes = graph.nodes

        console.log(this.nodes, this.statements)
    }

    private getCurrentNode = (current: statement) : nodeCore => {
        return this.nodes[current.idLogic]
    }

    public isAdmit = () : boolean => {
        let current: statement = this.statements.get(this.startStatement.id)
        let oldCurrent = current
        let l = 0
        let i = current.idLogic
        let j = -1 //now we see at left column of table of def statements
        if (this.alphabet.size < 1) {
            console.log('Alphabet is empty, you should to enter edges')
            return current.isAdmit
        }
        console.log(this.getCurrentNode(current), 'NOW in', 'start statement')
        while (l < this.input.length) {
            //let isMoved: boolean = false
            j = this.input[l].idLogic
            if (this.matrix[i][j] === eof) {
                console.log(this.getCurrentNode(oldCurrent), 'FUBAR Aoutomata was stoped in ', oldCurrent, 'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j)
                return oldCurrent.isAdmit
            }
            oldCurrent = current
            current = this.matrix[i][j]
            console.log(this.getCurrentNode(current), 'NOW in',  ' ~ ', i, ' ', j)
            i = this.matrix[i][j].idLogic
            l++
        }
        console.log(this.getCurrentNode(current), 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        return current.isAdmit
    }

}
