import {EdgeCore, GraphCore, NodeCore} from "./IGraphTypes";
import {IComputer, Step} from "./IComputer";


export interface statement extends NodeCore {
    idLogic: number
}

export interface Edge extends EdgeCore {
    from: number
    to: number
    transitions: Set<string>
    localValue?: string[]
}

export type elementOfAlphabet = {
    value: string
    idLogic: number
}

export const eof: statement = {isAdmit: false, idLogic: -1, id: -1}

export class DFA implements IComputer {

    private readonly matrix: statement[][] = []
    private readonly input: elementOfAlphabet[] = []
    private readonly alphabet = new Map()
    private readonly statements = new Map()
    private readonly nodes!: NodeCore[]
    private readonly startStatement
    private edges: Edge[]
    private currentNode: NodeCore

    private getStatementsFromNodes = (nodes: NodeCore[]): void => {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(nodes[i].id, {isAdmit: nodes[i].isAdmit, idLogic: i})
        }
    }

    private getAlphabetFromEdges = (): void => {
        let alphabetSet: Set<string> = new Set()
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue!.forEach(value => alphabetSet.add(value))
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
            this.edges[i].localValue!.forEach(value => this.matrix[statementNumberFrom][this.alphabet.get(value)] = statementNumberTo)
            //console.log(this.statements.get(edges[i].from).idLogic, this.alphabet.get(edges[i].value), '<->', edges[i].value, this.statements.get(edges[i].to))
        }
    }

   // private getTransformedInput = (input: string[]): void => {
   //     input.forEach(value => {
   //         this.input.push({idLogic: this.alphabet.get(value), value: value})
   //         //console.log(value, this.alphabet.get(value))
   //     })
   // }

    public setInput = (input: string[]): void => {
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
            //console.log(value, this.alphabet.get(value))
        })
    }
    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        this.edges = graph.edges.sort((a, b) => a.from - b.from)
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].localValue = []
            this.edges[i].transitions.forEach(value => this.edges[i].localValue!.push(value))
        }
        console.log('EDGES: ', this.edges)
        this.getAlphabetFromEdges()
        console.log('ALPHABET: ', this.alphabet)
        this.setInput(input)
        this.getStatementsFromNodes(graph.nodes)
        console.log('STATEMENTS: ', this.statements)
        this.createMatrix()
        console.log('MATRIX ', this.matrix)
        this.startStatement = startStatement
        this.currentNode = startStatement
        this.nodes = graph.nodes
        //console.log(this.nodes, this.statements)
    }

    //setInput: (input: string[]) => void;
    //step: (current: NodeCore, input: string) => Step;
    //getCurrent: () => NodeCore;

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

    //public nextNode = (current: NodeCore, input: string) : NodeCore => {
    //    if (!this.isPossibleTransition(current, input)) {
    //        return current
    //    }
    //    let currentStatement: statement = this.statements.get(current.id)
    //    let transformedInput: number = this.alphabet.get(input)
    //    return this.nodes[this.matrix[currentStatement.idLogic][transformedInput].idLogic]
    //}
    private counterSteps: number = 0
    private counterStepsForResult: number = 0
    public step = (input: string) : Step => {
        if (!this.isPossibleTransition(this.currentNode, input)) {
            return {node: this.currentNode, counter: this.counterSteps}
        }
        let currentStatement: statement = this.statements.get(this.currentNode.id)
        let transformedInput: number = this.alphabet.get(input)
        this.counterSteps++
        return {node: this.nodes[this.matrix[currentStatement.idLogic][transformedInput].idLogic],
                counter: this.counterSteps}
    }

    public restart = () : void => {
        this.currentNode = this.startStatement
        this.counterSteps = 0
        //this.counterStepsForResult = 0
    }

    // Get next node by edge symbol. (Nodes for visualization)
 //   public nextNode = (current: NodeCore, input: string) : NodeCore => {
 //       if (!this.isPossibleTransition(current, input)) {
 //           return current
 //       }
 //       let currentStatement: statement = this.statements.get(current.id)
 //       let transformedInput: number = this.alphabet.get(input)
 //       return this.nodes[this.matrix[currentStatement.idLogic][transformedInput].idLogic]
 //   }

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
            return {node: current, counter: this.counterStepsForResult}
        }
        console.log(this.getCurrentNode(current), 'NOW in', 'start statement')
        while (l < this.input.length) {
            j = this.input[l].idLogic
            if (this.matrix[i][j] === eof) {
                console.log(this.getCurrentNode(oldCurrent), 'FUBAR Aoutomata was stoped in ', oldCurrent, 'because string in matrix has only EOF values (noway from this statement)', ' in: ', i, ' ', j)
                return {node: oldCurrent, counter: this.counterStepsForResult}
            }
            oldCurrent = current
            current = this.matrix[i][j]
            this.counterStepsForResult++
            console.log(this.getCurrentNode(current), 'NOW in',  ' ~ ', i, ' ', j)
            i = this.matrix[i][j].idLogic
            l++
        }
        console.log(this.getCurrentNode(current), 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        return {node: current, counter: this.counterStepsForResult}
    }

}

/*
let t: Set<string> = new Set
let tt: Set<string> = new Set

t.add('z')
tt.add('z')
tt.add('a')

let a: Set<string> = new Set
let aa: Set<string> = new Set

a.add('0')
aa.add('1')


let dfa = new DFA(
    {
        nodes: [
            {id: -100, isAdmit: false},
            {id: 1, isAdmit: true},
            {id: 2, isAdmit: true}
        ],
        edges: [
            {from: -100, to: 1, transitions: a},
            {from: 1, to: 2, transitions: aa}
        ]
    }, {id: -100, isAdmit: false}, ['0', '1'])

let testFunc = (dfa: DFA, current: NodeCore, input: string[]) : boolean => {
    for (let i = 0; i < input.length; i++) {
        // if (!dfa.isPossibleTransition(current, input[i])) {
        //     console.log('empty')
        //     return false
        // }
      //  current = dfa.s(current, input[i])
        //console.log(current)
    }
    return current.isAdmit
}

console.log(testFunc(dfa, {id: -100, isAdmit: false}, ['0', '1']))
*/
/*
let dfa = new DFA(
    {
        nodes: [
            {id: -100, isAdmit: true},
            {id: 1, isAdmit: false},
        ],
        edges: [
            {from: -100, to: 1, localValue: ['z']},
            {from: 1, to: -100, localValue: ['z']}
        ]
    }, {id: 1, isAdmit: true}, ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'])
*/
//let input: string[] = ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z']

//let curren: nodeCore = {id: -100, isAdmit: true}
//for (let i = 0; i < input.length; i++) {
//    curren = dfa.nextNode(curren, input[i])
//    console.log(curren)
//}


//console.log(dfa.nextNode({id: 1, isAdmit: true}, 'z'))
/*console.log(dfa.nextNode( {id: 1, isAdmit: true}, 'z'))
console.log(dfa.nextNode( {id: -100, isAdmit: false}, 'z'))
console.log(dfa.nextNode( {id: 1, isAdmit: true}, 'z'))*/

//setter input!



//step
//isSuccess