import {edgeCore, graphCore, nodeCore} from "./IGraphTypes";

export interface statement extends nodeCore {
    idLogic: number
}
export type elementOfAlphabet = {
    value: string
    idLogic: number
}

export const eof: statement = { isAdmit: false, idLogic: -1 }

export class DFA {

    private readonly matrix: statement[][] = []
    private readonly input: elementOfAlphabet[] = []
    private readonly alphabet = new Map()
    private readonly statements = new Map()
    private readonly startStatement

    private getStatementsFromNodes = (nodes: nodeCore[]) : void => {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {isAdmit: nodes[i].isAdmit, idLogic: i})
        }
    }

    private getAlphabetFromEdges = (edges: edgeCore[]) : void => {
        let alphabetSet: Set<string> = new Set
        for (let i = 0; i < edges.length; i++) {
            alphabetSet.add(edges[i].value)
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
            let alphabetSymbolNumber = this.alphabet.get(edges[i].value)
            let statementNumberTo = this.statements.get(edges[i].to)
            this.matrix[statementNumberFrom][alphabetSymbolNumber] = statementNumberTo
            //console.log(this.statements.get(edges[i].from).idLogic, this.alphabet.get(edges[i].value), '<->', edges[i].value, this.statements.get(edges[i].to))
        }
    }

    private getTransformedInput = (input: string[]) : void => {
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
            console.log(value, this.alphabet.get(value))
        })
    }

    constructor(startStatement: nodeCore, graph: graphCore, input: string[] /*statements: statement[], matrix: statement[][], input: elementOfAlphabet[] , alphabet: elementOfAlphabet[]*/) {
        //this.statements = statements
        //this.input = input
        //this.matrix = matrix
        //this.alphabet = alphabet
        //this.startStatement = statements[0]

        let edges = graph.edges.sort((a, b) => a.from - b.from)
        //console.log(edges)
        this.getAlphabetFromEdges(edges)
        //console.log(this.alphabet)
        this.getStatementsFromNodes(graph.nodes)
        //console.log(this.statements)
        this.createMatrix(edges)
        //console.log(this.matrix)
        this.startStatement = startStatement
        this.getTransformedInput(input)
    }

    public isAdmit = () : boolean => {
        let current: statement = this.statements.get(this.startStatement.id)
        let oldCurrent = current
        let l = 0
        let i = current.idLogic
        let j = -1 //now we see at left column of table of def statements
        console.log('NOW in', current, 'start statement')
        while (l < this.input.length) {
            j = this.input[l].idLogic
            if (this.matrix[i][j] === eof) {
                console.log('FUBAR Aoutomata was stoped in ', oldCurrent, 'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j)
                return oldCurrent.isAdmit
            }
            oldCurrent = current
            current = this.matrix[i][j]
            console.log('NOW in', current, ' ~ ', i, ' ', j)
            i = this.matrix[i][j].idLogic
            l++
        }
        console.log('Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        return current.isAdmit
    }

}
/*
let q0: statement = {id: 0, isAdmit: true, idLogic: 0}
let q1: statement = {id: 1, isAdmit: false, idLogic: 1}

let matrix: statement[][] = [
    [q1,q1],
    [q0,q0]
]*/
//let dfa = new DFA([q0, q1] ,matrix, [{idLogic: 0, value: '0'},  {idLogic: 1, value: '0'}], [{idLogic: 0, value: '0'}, {idLogic: 1, value: '1'}])
let dfa = new DFA( {id: 0, isAdmit: true},
    {
        nodes: [
            {id: 0, isAdmit: true},
            {id: 44, isAdmit: false},
            {id: 88, isAdmit: false}
        ],
    edges: [
        {from: 0, to: 44, value: '0'},
        {from: 44, to: 88, value: '0'},
        {from: 88, to: 88, value: 'a'}
]
}, ['0','0','a'])
dfa.isAdmit()