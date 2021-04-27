import {elementOfAlphabet, History, statement, statementNfa, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {Computer, eof, EPS} from "./Computer";
import {NFA} from "./NFA";
import {Simulate} from "react-dom/test-utils";
import input = Simulate.input;
import {DFA} from "./DFA";

type computational = {
    statements: statementNfa[]
    //alphabet: elementOfAlphabet[]
    matrix: statementNfa[][]
}

export class EpsilonNFA extends Computer {

    private matrix: statementNfa[][] = []
    private statementsNfa: statementNfa[] = []
    private numbersStatementsNfa: Map<string, statementNfa> = new Map()
    private currentNodeNfa: statementNfa
    public historiStep: History[] = []
    public historiRun: History[] = []

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
        let set: Set<statement> = new Set()
        set.add(value)
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
            this.edges[i].localValue.forEach(value => {
                let cell = this.matrix[statementNumberFrom][this.alphabet.get(value)]
                if (cell.id === -1) {
                    cell.value = []
                    this.pushValueStatmentNfa(cell, statementNumberTo)
                    //  cell.value.push(statementNumberTo)
                    cell.id = this.getIdStatementsNfa(cell.value)
                    cell.isAdmit = this.isAdmitStatementNfa(cell.value)
                } else if (cell.value.length > 0){
                    this.pushValueStatmentNfa(cell, statementNumberTo)
                    //  cell.value.push(statementNumberTo)
                    cell.id = this.getIdStatementsNfa(cell.value)
                    cell.isAdmit = this.isAdmitStatementNfa(cell.value)
                    /*                    this.addSts(cell, [statementNumberTo])
                                        cell.isAdmit = this.isAdmitStatementNfa(cell.value)*/
                }

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
                    /*                    cell.id = this.getIdStatementsNfa(cell.value)
                                        cell.isAdmit = this.isAdmitStatementNfa(cell.value)*/
                    //cell.value.push(value1)
                    valOfNewStatement.push(value1)
                }
            })
        })
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

                this.matrix[statementPush.id][eps].id = this.getIdStatementsNfa(this.matrix[statementPush.id][eps].value)
                this.matrix[statementPush.id][eps].isAdmit = this.isAdmitStatementNfa(this.matrix[statementPush.id][eps].value)
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

                this.pushValueStatmentNfa(this.matrix[i][eps], this.statements.get(this.nodes[i].id))
                this.matrix[i][eps].id = this.getIdStatementsNfa(this.matrix[i][eps].value)
                this.matrix[i][eps].isAdmit = this.isAdmitStatementNfa(this.matrix[i][eps].value)
            } else {
                this.pushValueStatmentNfa(this.matrix[i][eps], this.statements.get(this.nodes[i].id))
                /*                this.matrix[i][eps].id = this.getIdStatementsNfa(this.matrix[i][eps].value)
                                this.matrix[i][eps].isAdmit = this.isAdmitStatementNfa(this.matrix[i][eps].value)*/
            }
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
                    secondEpsilon.forEach(value => {
                        if (this.matrix[i][j].id === -1) {
                            this.matrix[i][j].value = []
                            this.pushValueStatmentNfa(this.matrix[i][j], value)
                            this.matrix[i][j].id = this.getIdStatementsNfa(this.matrix[i][j].value)
                            this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)
                        } else {
                            this.pushValueStatmentNfa(this.matrix[i][j], value)
                            this.matrix[i][j].id = this.getIdStatementsNfa(this.matrix[i][j].value)
                            this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)
                        }
                    })
                }
            }
        }
        /*        console.log('ENFA-NFA: ')
                this.statementsNfa.forEach(value => console.log(value))
                console.log(' ')*/
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


    private creatMatrixWithoutEColumn(matrix: statementNfa[][]): statementNfa[][] {
        let eps: number = this.alphabet.get(EPS)
        let ret: statementNfa[][] = []
        for (let i = 0; i < matrix.length; i++) {
            let tmp: statementNfa[] = []
            for (let j = 0; j < matrix[i].length; j++) {
                if (j != eps) {
                    tmp.push(matrix[i][j])
                }
            }
            ret.push(tmp)
        }
        return ret
    }

    private getShell(statement: statementNfa, statements: statementNfa[]) {
        let set: Set<statement> = new Set<statement>()
        statement.value.forEach(value => set.add(value))
        let oldSize = set.size


        for (let i = 0; i < statements.length; i++) {
            set.add(statements[i].value[0])
            if (set.size === oldSize) {
                statements[i].value.forEach(value => set.add(value))
            } else {
                set.delete(statements[i].value[0])
            }
        }
    }

    private groupUp(computational: computational): computational {
        computational.statements.sort((a, b) => b.value.length - a.value.length)
        for (let i = 0; i < computational.statements.length-1; i++) {
            let cur: number[] = []
            computational.statements[i].value.forEach(value => cur.push(value.idLogic))
            cur.sort((a, b) => a - b)
            for (let j = i+1; j < computational.statements.length; j++) {
                let tmp: number[] = []
                computational.statements[j].value.forEach(value => tmp.push(value.idLogic))
                tmp.sort((a, b) => a - b)
                if (computational.statements[j].id != -1 && cur.toString().indexOf(tmp.toString()) !== -1) {
                    computational.statements[j].id = -1
                }
            }
        }
        let statementsRet: statementNfa[] = []
        computational.statements.forEach(value => {
            if (value.id !== -1) {
                statementsRet.push(value)
            }
        })
        statementsRet.forEach(value => console.log(value))
        let eps: number | undefined = this.alphabet.get(EPS)
        let matrixRet: statementNfa[][] = []
        statementsRet.forEach(value => {
            //console.log(this.matrix[value.id])
            let push: statementNfa[] = []
            for (let i = 0; i < this.matrix[value.id].length; i++) {
                if (i !== eps) {
                    push.push(this.matrix[value.id][i])
                }
            }
            matrixRet.push(push)
        })
        let map: Map<number, statementNfa> = new Map<number, statementNfa>()
        statementsRet.forEach((value, index) => {
            let id = value.id
            value.id = index
            map.set(id, value)
        })

        for (let i = 0; i < matrixRet.length; i++) {
            for (let j = 0; j < matrixRet[i].length; j++) {
                let updatedStateent: statementNfa | undefined = map.get(matrixRet[i][j].id)
                if (updatedStateent !== undefined) {
                    matrixRet[i][j] = updatedStateent
                } else {
                    matrixRet[i][j] = {id: -1, value: [eof], isAdmit: false}
                }
            }
        }
        return {statements: statementsRet, matrix: matrixRet}
    }

    private startStatementNfa(): statementNfa {
        let id: number = 0
        for (let i = 0; i < this.statementsNfa.length; i++) {
            for (let j = 0; j < this.statementsNfa[i].value.length; j++) {
                if (this.statementsNfa[i].value[j] === this.statements.get(this.startStatements[0].id)) {
                    id = i
                    // console.log(this.statementsNfa[i].value[j],'-' , this.statements.get(this.startStatement.id))
                }
            }
        }
        // console.log(this.startStatement, this.statementsNfa[id])
        return this.statementsNfa[id]
    }

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements)

        this.createMatrix()
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
        }
        this.nfaToDfa()
        this.correctionEmptyNodes()
        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatements[0].id)])]
        //  console.log('!!!',  this.currentNodeNfa)
        this.createSmallMatrix()
        if (this.haveEpsilon()) {
            this.currentNodeNfa = this.matrix[this.currentNodeNfa.id][this.alphabet.get(EPS)]
        }

/*        this.matrix.forEach(value => {
            console.log(' ')
            value.forEach(value1 => console.log(value1))
        })
        console.log('****')
        this.statementsNfa.forEach(value => console.log(value))
        console.log('****')
        console.log(this.currentNodeNfa)
        console.log('****')*/
        this.historiStep.push({nodes: this.toNodes(this.currentNodeNfa), by: EPS})
        this.setInput(input)
        //this.historiRun.push({nodes: this.toNodes(this.currentNodeNfa), by: EPS})
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

    private toSteps(statement: statementNfa, counter: number, history: History[]): Step {
        let retNodes: NodeCore[] = []
        statement.value.forEach(value => {
            let temp: NodeCore = this.nodes[value.idLogic]
            retNodes.push(temp)
        })
        return {nodes: retNodes, counter: counter, isAdmit: statement.isAdmit, history: history}
    }

    private toNodes(statement: statementNfa): NodeCore[] {
        let retNodes: NodeCore[] = []
        statement.value.forEach(value => {
            let temp: NodeCore = this.nodes[value.idLogic]
            retNodes.push(temp)
        })
        return retNodes
    }

    private getLetterFromAlphabet(numb: number): string {
        let by: string = '!?'
        this.alphabet.forEach((value, key) => {
            if (this.alphabet.get(key) === numb) {
                by = key
            }
        })
        if (by === '!?') {
            throw new Error('!?')
        }
        return by
    }

    public getTrendyNode(): Step {
        return this.toSteps(this.currentNodeNfa, this.counterSteps, this.historiStep)
    }

    private createSmallMatrix(): void {
        let isVisited: boolean[] = []
        let ret: statementNfa[] = []
        this.statementsNfa.forEach(() => isVisited.push(false))
        this.createSmallMatrixDfs(this.currentNodeNfa, this.matrix, isVisited, ret)
        let sup: statementNfa[] = []
        ret.forEach(value => sup.push({value: value.value, id: value.id, isAdmit: value.isAdmit}))
        let map: Map<number, number> = new Map<number, number>()
        for (let i = 0; i < ret.length; i++) {
            map.set(ret[i].id, i)
            ret[i].id = i
        }
        let smallMatrix: statementNfa[][] = []
        for (let i = 0; i < sup.length; i++) {
            let tmp: statementNfa[] = []
            for (let j = 0; j < this.matrix[sup[i].id].length; j++) {
                //tmp.push(ret[map.get(this.matrix[sup[i].id][j])!])
                let id = map.get(this.matrix[sup[i].id][j].id)
                if (id === undefined) {
                    tmp.push({value: [eof], isAdmit: false, id: -1})
                } else {
                    tmp.push(ret[id])
                }
            }
            smallMatrix.push(tmp)
        }
        this.matrix = smallMatrix
        this.statementsNfa = ret
    }

    private createSmallMatrixDfs(statement: statementNfa, matrix: statementNfa[][], isVisited: boolean[], ret: statementNfa[]): void {
        isVisited[statement.id] = true
        ret.push(this.statementsNfa[statement.id])
        for (let i = 0; i < matrix[statement.id].length; i++) {
            if (!isVisited[matrix[statement.id][i].id] && matrix[statement.id][i].id !== -1) {
                //console.log(matrix[statement.id][i].id], )
                this.createSmallMatrixDfs(matrix[statement.id][i], matrix, isVisited, ret)
            }
        }
    }

    public isDeterministic(): boolean {
        return this.statementsNfa.length === this.statements.size
    }

    public run(): Step {
        this.historiRun = []
        let isEmptyInput: boolean = false /////////////////////////////////<-
        if (this.input.length === 0) {
            isEmptyInput = true
        }

        this.counterStepsForResult = 0
        // let current: statementNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatements[0].id)])]//this.startStatementNfa()

        let current = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatements[0].id)])]
        if (this.haveEpsilon()) {
            current = this.matrix[this.currentNodeNfa.id][this.alphabet.get(EPS)]
        }
        this.historiRun.push({nodes: this.toNodes(current), by: EPS})

        let oldCurrent = current
        let l = 0
        let i = current.id
        let j = -1 //now we see at left column of table of def statements

        if (this.alphabet.size < 1) {
            console.log('Alphabet is empty, you should to enter edges')
            let retCounter: number = this.counterStepsForResult
            return this.toSteps(current, retCounter, this.historiRun)
        }
        //console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)), 'NOW in', 'start statement')
        while (l < this.input.length && !isEmptyInput) {
            j = this.input[l].idLogic
            if (this.matrix[i][j].id === -1) {
                let retCounter: number = this.counterStepsForResult /// current.value.length
                return this.toSteps(current, retCounter, this.historiRun)
                //return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
            }
            oldCurrent = current
            current = this.matrix[i][j]
            this.counterStepsForResult++
            i = this.matrix[i][j].id

            let by: string = this.getLetterFromAlphabet(j)
            this.historiRun.push({nodes: this.toNodes(current), by: by})/////////////////////
            l++
        } if (isEmptyInput) {
            j = this.alphabet.get(EPS) !== undefined ? this.alphabet.get(EPS) : -1
            if (j !== -1) {
                if (this.matrix[i][j].id === -1) {
                    // console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)))
                    let retCounter: number = this.counterStepsForResult /// current.value.length
                    return this.toSteps(current, retCounter, this.historiRun)
                    //return {node: this.nodes[current.idLogic], counter: this.counterStepsForResult}
                }
                current = this.matrix[i][j]
            }
        }
        //console.log(this.numbersStatementsNfa.get(this.keyOfStatementNfa(current.value)))//, 'Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        let retCounter: number = this.counterStepsForResult
        return this.toSteps(current, retCounter, this.historiRun)
    }

    public step(): Step {
        if (this.counterSteps >= this.input.length || !this.isPossibleTransition(this.input[this.counterSteps].value)) {
            return this.toSteps(this.currentNodeNfa, this.counterSteps, this.historiStep)
        }

        let transformedInput: number = this.alphabet.get(this.input[this.counterSteps].value)
        this.counterSteps++
        let by = this.getLetterFromAlphabet(transformedInput)
        this.currentNodeNfa = this.matrix[this.currentNodeNfa.id][transformedInput]
        this.historiStep.push({nodes: this.toNodes(this.currentNodeNfa), by: by})/////////////////////

        return this.toSteps(this.currentNodeNfa, this.counterSteps, this.historiStep)
    }

    public restart(): void {
        this.historiStep = []

        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatements[0].id)])] //this.startStatementNfa()
        if (this.haveEpsilon()) {
            this.currentNodeNfa = this.matrix[this.currentNodeNfa.id][this.alphabet.get(EPS)]
        }
        this.historiStep.push({nodes: this.toNodes(this.currentNodeNfa), by: EPS})

        this.counterSteps = 0
    }

    public setInput(input: string[]): void {
        this.input = []
        input.forEach(value => {
            this.input.push({idLogic: this.alphabet.get(value), value: value})
        })
        this.restart()
    }

    public haveEpsilon(): boolean {
        return this.alphabet.get(EPS) !== undefined
    }
}

/*
let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}
*/

/*let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: true},
            {id: 333, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet(['a'])},
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 1, to: 2, transitions: toSet(['b'])},
            {from: 0, to: 333, transitions: toSet(['a'])}
        ]
    }, [{id: 0, isAdmit: false}], ['a'])
console.log(nfa.run())*/
/*console.log(nfa.run())
console.log(nfa.step())
console.log(nfa.step())
nfa.setInput([])
console.log(nfa.run())
console.log(nfa.step())
console.log(nfa.step())*/
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
            {id: 10, isAdmit: false},
            {id: 111, isAdmit: true},
        ],
        edges: [
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 111, transitions: toSet([EPS])},
            {from: 1, to: 2, transitions: toSet([EPS])},
            {from: 1, to: 6, transitions: toSet([EPS])},
            {from: 2, to: 3, transitions: toSet([EPS])},
            {from: 2, to: 5, transitions: toSet([EPS])},
            {from: 3, to: 4, transitions: toSet(['a'])},
            {from: 4, to: 3, transitions: toSet([EPS])},
            {from: 4, to: 5, transitions: toSet([EPS])},
            {from: 5, to: 10, transitions: toSet([EPS])},
            {from: 6, to: 7, transitions: toSet([EPS])},
            {from: 6, to: 9, transitions: toSet([EPS])},
            {from: 7, to: 8, transitions: toSet(['b'])},
            {from: 8, to: 7, transitions: toSet([EPS])},
            {from: 8, to: 9, transitions: toSet([EPS])},
            {from: 9, to: 10, transitions: toSet([EPS])},
            {from: 10, to: 111, transitions: toSet([EPS])},
            {from: 10, to: 1, transitions: toSet([EPS])},
        ]
    }, [{id: 0, isAdmit: false}], ['a', 'b'])
 console.log(nfa.run())*/
/*
let nfa = new EpsilonNFA(
    {
        nodes: [
            {id: 0, isAdmit: false},
            {id: 1, isAdmit: false},
            {id: 2, isAdmit: false},
            {id: 3, isAdmit: true},
            {id: 4, isAdmit: true},
        ],
        edges: [
/!*            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 3, transitions: toSet([EPS])},
            {from: 0, to: 0, transitions: toSet([EPS])},
            {from: 0, to: 2, transitions: toSet([EPS])},*!/
            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 0, to: 1, transitions: toSet(['a'])},
            {from: 0, to: 3, transitions: toSet(['a'])},
            {from: 1, to: 2, transitions: toSet(['b'])},
/!*            {from: 0, to: 1, transitions: toSet([EPS])},
            {from: 1, to: 0, transitions: toSet([EPS])},
            {from: 0, to: 0, transitions: toSet([EPS])},
            {from: 1, to: 1, transitions: toSet([EPS])},*!/
        ]
    }, [{id: 0, isAdmit: false}], [])
console.log(nfa.step())
console.log(nfa.step())
console.log(nfa.step())
console.log(nfa.step())
/!*console.log(nfa.run())*!/
nfa.historiStep.forEach(value => {
    console.log(' ')
    console.log(value)
})
*/