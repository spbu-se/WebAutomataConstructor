import {statement, statementNfa, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {Computer, eof} from "./Computer";

export class NFA extends Computer {

    private matrix: statementNfa[][] = []
    private statementsNfa: statementNfa[] = []
    private numbersStatementsNfa: Map<string, statementNfa> = new Map()
    private currentNodeNfa: statementNfa

    private fromStatementsToStatementsNfa(): void {
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
        this.deleteRepetitions(statement.value)
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
        cell.id = this.getIdStatementsNfa(cell.value)
        cell.isAdmit = this.isAdmitStatementNfa(cell.value)
        return cell
    }

    private nfaToDfa(): void {
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

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement)
        this.setInput(input)
        this.createMatrix()
        this.nfaToDfa()
        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])]
       // console.log(this.alphabet)
       // console.log(' . . .')
       // this.matrix.forEach(value => {
       //     value.forEach(value1 => console.log(value1))
       //     console.log(' ')
       // })
       // console.log(' ------------')
       // console.log(this.currentNodeNfa)
       // console.log(this.statementsNfa)
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
}

let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}
