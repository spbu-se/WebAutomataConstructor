import {statement, statementNfa, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {Computer, eof, EPS} from "./Computer";
import {NFA} from "./NFA";

export class EpsilonNFA extends Computer {

    private matrix: statementNfa[][] = []
    private statementsNfa: statementNfa[] = []
    private numbersStatementsNfa: Map<string, statementNfa> = new Map()
    private currentNodeNfa: statementNfa

    private fromStatementsToStatementsNfa(): void {
        this.statementsNfa = []
        let i = 0
        this.statements.forEach((value) => {
            this.statementsNfa.push({value: [value], isAdmit: value.isAdmit, id: value.idLogic})
            this.numbersStatementsNfa.set(this.keyOfStatementNfa(this.statementsNfa[i].value), this.statementsNfa[i])
            i++
        })
    }

    private keyOfStatementNfa(statements: statement[]): string {
        statements.sort((a, b) => a.idLogic - b.idLogic)
        return JSON.stringify(statements)
    }

    private getIdStatementsNfa(statements: statement[]): number {
        let statementHelper = this.numbersStatementsNfa.get(this.keyOfStatementNfa(statements))
        if (statementHelper === undefined) {
            let lastId: number = this.statementsNfa.length
            this.statementsNfa.push({value: statements, id: lastId, isAdmit: false})
            this.numbersStatementsNfa.set(this.keyOfStatementNfa(this.statementsNfa[lastId].value), this.statementsNfa[lastId])
            return lastId
        }
        return statementHelper.id
    }

    private isAdmitStatementNfa(statements: statement[]): boolean {
        for (let i = 0; i < statements.length; i++) {
            if (statements[i].isAdmit) {
                let storageElement = this.numbersStatementsNfa.get(this.keyOfStatementNfa(statements))
                if (storageElement === undefined) {
                    throw "storageElement NFA"
                } else {
                    storageElement.isAdmit = true
                }
                return true
            }
        }
        return false
    }

    private deleteRepetitions(statements: statement[]): void {
        let set: Set<statement> = new Set()
        statements.forEach(value => set.add(value))
        statements = []
        set.forEach((value: statement) => statements.push(value))
    }

    private pushValueStatmentNfa(statement: statementNfa, value: statement): void {
        statement.value.push(value)
        let set: Set<statement> = new Set()
        statement.value.forEach(value => set.add(value))
        statement.value = []
        set.forEach((value: statement) => statement.value.push(value))
    }

    private createMatrix(): void {
        this.fromStatementsToStatementsNfa()
        for (let i = 0; i < this.statements.size; i++) {
            this.matrix[i] = []
            for (let j = 0; j < this.alphabet.size; j++) {
                this.matrix[i][j] = {id: -1, value: [eof], isAdmit: false}
            }
        }
        for (let i = 0; i < this.edges.length; i++) {
            let statementNumberFrom = this.statements.get(this.edges[i].from).idLogic
            let statementNumberTo = this.statements.get(this.edges[i].to)
            this.edges[i].localValue
                .forEach(value => {
                    let cell = this.matrix[statementNumberFrom][this.alphabet.get(value)]
                    if (cell.id === -1) {
                        cell.value = []
                    }
                    this.pushValueStatmentNfa(cell, statementNumberTo)
                    //  cell.value.push(statementNumberTo)
                    cell.id = this.getIdStatementsNfa(cell.value)
                    cell.isAdmit = this.isAdmitStatementNfa(cell.value)
                })
        }
    }

    private calculateTransition(statement: statementNfa, letterValue: number): statementNfa {
        let valOfNewStatement: statement[] = []
        let cell: statementNfa = {value: [], isAdmit: false, id: -1}
        statement.value.forEach(value => {
            this.matrix[value.idLogic][letterValue].value.forEach(value1 => {
                if (value1.idLogic != -1) {
                    this.pushValueStatmentNfa(cell, value1)
                    //cell.value.push(value1)
                    valOfNewStatement.push(value1)
                }
            })
        })
/*        if (cell.value.length === 0) {
            console.log("pushValue WTF :", cell.value)
        }*/
        cell.id = this.getIdStatementsNfa(cell.value)
        cell.isAdmit = this.isAdmitStatementNfa(cell.value)
        return cell
    }

    private nfaToDfa() : void {
        let eps = this.alphabet.get(EPS)
        if (this.matrix.length < this.statementsNfa.length) {
            let start = this.matrix.length
            for (let i = start; i < this.statementsNfa.length; i++) {
                this.matrix.push([])
                for (let j = 0; j < this.alphabet.size; j++) {
                    this.matrix[i].push(this.calculateTransition(this.statementsNfa[i], j))
                }
            }
        }
    }

    private dfsForEpsiolon(statement: statementNfa, isVisited: boolean[], statementPush: statementNfa): void {
        isVisited[statement.id] = true
        let eps = this.alphabet.get(EPS)
        let cellCurrent = this.matrix[statement.id][eps]
        for (let i = 0; i < cellCurrent.value.length; i++) {
            for (let j = 0; j < cellCurrent.value.length; j++) {
                this.pushValueStatmentNfa(this.matrix[statementPush.id][eps], cellCurrent.value[j])
            }
            if (!isVisited[cellCurrent.value[i].idLogic]) {
                let itNode = cellCurrent.value[i].idLogic
                let idNode = this.nodes[itNode].id
                this.dfsForEpsiolon(this.statementsNfa[this.statements.get(idNode).idLogic], isVisited, statementPush)
            }
        }
    }

    private deleteEpsilonColumn(): void {
        let eps = this.alphabet.get(EPS)
        this.matrix.forEach(value => delete value[eps])
    }

    private addEpsilonCycles(): void {
        let eps = this.alphabet.get(EPS)
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[i][eps].id === -1) {
                this.matrix[i][eps].value = []
            }
            this.pushValueStatmentNfa(this.matrix[i][eps], this.statements.get(this.nodes[i].id))
        }
    }

    private valuesAfterTransition(statement: statementNfa, it: number): statement[] {
        return this.matrix[statement.id][it].value
    }


    private enfaToNfa(): void {
        let eps = this.alphabet.get(EPS)
        for (let i = 0; i < this.matrix.length; i++) {
            let firstEpsilon = this.valuesAfterTransition(this.statementsNfa[i], eps)
         //   console.log(firstEpsilon)
            for (let j = 0; j < this.matrix[i].length; j++) {
                if (j !== eps) {
                    let valueByLetter: statement[] = []
                    firstEpsilon.forEach(value => {
                        this.valuesAfterTransition(this.statementsNfa[value.idLogic], j).forEach(value1 => {
                            if (value1.idLogic !== -1) {
                                valueByLetter.push(value1)
                            }
                        })
                    })
                    //console.log('   ',valueByLetter)
                    let secondEpsilon: statement[] = []
                    if (valueByLetter.length > 0) {
                        valueByLetter.forEach(value => {
                            this.valuesAfterTransition(this.statementsNfa[value.idLogic], eps).forEach(value1 => {
                                if (value1.idLogic !== -1) {
                                    secondEpsilon.push(value1)
                                }
                            })
                        })
                    }
/*                    console.log('       ',secondEpsilon)
                    console.log(i)*/
                    secondEpsilon.forEach(value => {
                        if (this.matrix[i][j].id === -1) {
                            this.matrix[i][j].value = []
                        }
                        this.pushValueStatmentNfa(this.matrix[i][j], value)
                        //  cell.value.push(statementNumberTo)
                        this.matrix[i][j].id = this.getIdStatementsNfa(this.matrix[i][j].value)
                        this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)

                    })
                }
            }
        }
        //console.log('ENFA-NFA: ', this.statementsNfa)
    }

    private correctionEmptyNodes(): void {
        this.matrix.forEach(value => {
            value.forEach(value1 => {
                if (value1.value.length === 0) {
                    value1.id = -1
                }
            })
        })
    }

    public haveEpsilon(): boolean {
        return this.alphabet.get('Epsilon') !== undefined
    }

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement)
        this.setInput(input)
        this.createMatrix()
        //console.log(this.statements.get(this.nodes[0].id))
        if (this.haveEpsilon()) {
           this.addEpsilonCycles()
            for (let i = 0; i < this.statements.size; i++) {
                let isVisited: boolean[] = []
                for (let i = 0; i < this.statements.size; i++) {
                    isVisited.push(false)
                }
                this.dfsForEpsiolon(this.statementsNfa[i], isVisited, this.statementsNfa[i])
            }
            this.enfaToNfa()
            //this.deleteEpsilonColumn()
        }

        this.nfaToDfa()
        this.correctionEmptyNodes()             ///////////////////// ? ???? ? ?? ?? ??
        // console.log(this.alphabet)
/*        console.log(' . . .')
        this.matrix.forEach(value => {
            value.forEach(value1 => console.log(value1))
            console.log(' ')
        })
        console.log('******************************')*/
      //  console.log(this.statementsNfa)
        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])]
    }

    private getNodeFromStatement(statement: statement): NodeCore {
        if (statement === eof) {
            return {id: -1, isAdmit: false}
        }
        return this.nodes[statement.idLogic]
    }

    private isPossibleTransition(input: string): boolean {
        let transformedInput: number = this.alphabet.get(input)
        return  !(this.matrix[this.currentNodeNfa.id][transformedInput].id === -1
            || this.matrix[this.currentNodeNfa.id][transformedInput] === undefined)
    }

    private toSteps(statement: statementNfa, counter: number): Step {
        let retNodes: NodeCore[] = []
        statement.value.forEach(value => {
            let temp: NodeCore = this.nodes[value.idLogic]
            retNodes.push(temp)
        })
        return {nodes: retNodes, counter: counter, isAdmit: statement.isAdmit}
    }

    public setInput(input: string[]): void {
        this.input = []
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
        })
        this.restart()
    }

    public restart(): void {
        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])]
        this.counterSteps = 0
    }

    public step(): Step {
        if (this.counterSteps >= this.input.length || !this.isPossibleTransition(this.input[this.counterSteps].value)) {
            return this.toSteps(this.currentNodeNfa, this.counterSteps)
        }
        let transformedInput: number = this.alphabet.get(this.input[this.counterSteps].value)
        this.counterSteps++
        this.currentNodeNfa = this.matrix[this.currentNodeNfa.id][transformedInput]
        return this.toSteps(this.currentNodeNfa, this.counterSteps)
    }

    public getTrendyNode(): Step {
        return this.toSteps(this.currentNodeNfa, this.counterSteps)
    }

    public run(): Step {
        this.counterStepsForResult = 0
        let current: statementNfa = this.statementsNfa[this.statements.get(this.startStatement.id).idLogic]
        let oldCurrent = current
        let l = 0
        //console.log(current)
        let i = current.id
        let j = -1 //now we see at left column of table of def statements
        if (this.alphabet.size < 1) {
            console.log('Alphabet is empty, you should to enter edges')
            let retCounter: number = this.counterStepsForResult
            return this.toSteps(current, retCounter)
        }
        //console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)), 'NOW in', 'start statement')
        while (l < this.input.length) {
            j = this.input[l].idLogic
            if (this.matrix[i][j].id === -1) {
                // console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)))
                let retCounter: number = this.counterStepsForResult /// current.value.length
                return this.toSteps(current, retCounter)
                //return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
            }
            oldCurrent = current
            current = this.matrix[i][j]
            this.counterStepsForResult++
            //console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)))
            i = this.matrix[i][j].id
            l++
        }
        //console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)))//, 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        let retCounter: number = this.counterStepsForResult
        return this.toSteps(current, retCounter)
    }

    isDeterministic() {
        return this.statementsNfa.length === this.statements.size
    }
}

let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}
/*

let nfa = new EpsilonNFAa(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 0, transitions: toSet(['0'])},
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 1, to: 1, transitions: toSet(['1'])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 2, to: 2, transitions: toSet(['0', '1'])},
        ]
    }, {id: 0, isAdmit: false}, ['0'])
*/



/*
let nfa = new EpsilonNFAa(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
            {id: 5, isAdmit: false},
            {id: 6, isAdmit: false},
            {id: 7, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 1, to: 1, transitions: toSet(['0', '1'])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet(['0'])},
            {from: 2, to: 4, transitions: toSet(['1'])},
            {from: 3, to: 5, transitions: toSet(['0'])},
            {from: 4, to: 5, transitions: toSet(['1'])},
            {from: 5, to: 6, transitions: toSet([EPS])},
            {from: 6, to: 6, transitions: toSet(['0', '1'])},
            {from: 6, to: 7, transitions: toSet([EPS])},
            /!*{from: 6, to: 0, transitions: toSet(['eps'])}*!/
        ]
    }, {id: 0, isAdmit: false}, ['0'])
*/


/*
let nfa = new EpsilonNFAa(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 0, transitions: toSet(['0'])},
            {from: 0, to: 1, transitions: toSet([eps])},
            {from: 1, to: 1, transitions: toSet(['1'])},
            {from: 1, to: 2, transitions: toSet([eps])},
            {from: 2, to: 2, transitions: toSet(['0', '1'])},
        ]
    }, {id: 0, isAdmit: false}, ['0'])
*/



/*let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 1, isAdmit: true},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
            {id: 5, isAdmit: false},
            {id: 6, isAdmit: false},
        ],
        edges: [
            {from: 1, to: 2, transitions: toSet(['0'])},
            {from: 2, to: 3, transitions: toSet(['0'])},
            {from: 2, to: 5, transitions: toSet(['1'])},
            {from: 3, to: 4, transitions: toSet(['1'])},
            {from: 4, to: 1, transitions: toSet([EPS])},
            {from: 5, to: 1, transitions: toSet([EPS])},
            {from: 5, to: 6, transitions: toSet(['0'])},
            {from: 6, to: 1, transitions: toSet([EPS])}
        ]
    }, {id: 1, isAdmit: true}, ['0', '0', '1', '0', '1', '0'])

console.log(nfa.run())*/
/*
let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: true},
        ],
        edges: [
            {from: 1, to: 2, transitions: toSet(['0', '1'])},
            {from: 1, to: 2, transitions: toSet(['1'])},
            {from: 2, to: 3, transitions: toSet(['0'])},
            {from: 3, to: 4, transitions: toSet(['1'])},
            {from: 4, to: 4, transitions: toSet(['0', '1'])}
        ]
    }, {id: 3, isAdmit: false}, ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'])

*/
/*let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
            {id: 5, isAdmit: false},
            {id: 6, isAdmit: false},
            {id: 7, isAdmit: false},
            {id: 8, isAdmit: false},
            {id: 9, isAdmit: false},
            {id: 10, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 7, transitions: toSet([EPS])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 1, to: 4, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet(['a'])},
            {from: 3, to: 6, transitions: toSet([EPS])},
            {from: 5, to: 6, transitions: toSet([EPS])},
            {from: 6, to: 1, transitions: toSet([EPS])},
            {from: 6, to: 7, transitions: toSet([EPS])},
            {from: 7, to: 8, transitions: toSet(['a'])},
            {from: 8, to: 9, transitions: toSet(['b'])},
            {from: 9, to: 10, transitions: toSet(['b'])},
        ]
    }, {id: 0, isAdmit: false}, ['a', 'a', 'b', 'b'])*/
/*let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: true},
            {id: 3, isAdmit: false},
        ],
        edges: [
            {from: 1, to: 2, transitions: toSet(['a'])},
            {from: 1, to: 3, transitions: toSet(['a'])},
            {from: 2, to: 2, transitions: toSet(['b'])},
            {from: 2, to: 1, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet(['b'])},
            {from: 3, to: 2, transitions: toSet(['a'])},
        ]
    }, {id: 1, isAdmit: false}, ['b'])*/

//(a|b)*
/*
let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
            {id: 5, isAdmit: false},
            {id: 6, isAdmit: false},
            {id: 7, isAdmit: false},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 7, transitions: toSet([EPS])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 1, to: 4, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet(['a'])},
            {from: 3, to: 6, transitions: toSet([EPS])},
            {from: 4, to: 5, transitions: toSet(['b'])},
            {from: 5, to: 6, transitions: toSet([EPS])},
            {from: 6, to: 1, transitions: toSet([EPS])},
            {from: 6, to: 7, transitions: toSet([EPS])},
        ]
    }, {id: 0, isAdmit: false}, ['a','b', 'a'])
*/

//(a*|b*)*
/*
let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
            {id: 5, isAdmit: false},
            {id: 6, isAdmit: false},
            {id: 7, isAdmit: false},
            {id: 8, isAdmit: false},
            {id: 9, isAdmit: false},
            {id: 10, isAdmit: false},
            {id: 11, isAdmit: false},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 11, transitions: toSet([EPS])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 1, to: 6, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet([EPS])},
            {from: 2, to: 5, transitions: toSet([EPS])},
            {from: 3, to: 4, transitions: toSet(['a'])},
            {from: 4, to: 3, transitions: toSet([EPS])},
            {from: 4, to: 5, transitions: toSet([EPS])},
            {from: 5, to: 10, transitions: toSet([EPS])},
            {from: 10, to: 11, transitions: toSet([EPS])},
            {from: 10, to: 1, transitions: toSet([EPS])},
            {from: 6, to: 7, transitions: toSet([EPS])},
            {from: 6, to: 9, transitions: toSet([EPS])},
            {from: 7, to: 8, transitions: toSet(['b'])},
            {from: 8, to: 7, transitions: toSet([EPS])},
            {from: 8, to: 9, transitions: toSet([EPS])},
            {from: 9, to: 10, transitions: toSet([EPS])},

        ]
    }, {id: 0, isAdmit: false}, ['a','a','b','b'])

*/

/*
let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: false},
            {id: 4, isAdmit: false},
        ],
        edges: [
            {from: 1, to: 1, transitions: toSet(['0','1'])},
            {from: 1, to: 2, transitions: toSet(['0'])},
            {from: 2, to: 3, transitions: toSet(['1'])},
            {from: 3, to: 4, transitions: toSet(['1'])},
            {from: 4, to: 4, transitions: toSet(['0', '1'])},

        ]
    }, {id: 1, isAdmit: false}, ['0'])



console.log('->', nfa.run())*/
