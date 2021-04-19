import {elementOfAlphabet, statement, statementNfa, Step} from "./Types";
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

    private addSts(cell: statementNfa, statements: statement[]): void {
        this.numbersStatementsNfa.delete(this.keyOfStatementNfa(cell.value))

        let set: Set<statement> = new Set()

        cell.value.forEach(value => set.add(value))
        statements.forEach(value => set.add(value))

        //console.log(set)

        cell.value = []
        set.forEach(value => cell.value.push(value))

        this.numbersStatementsNfa.set(this.keyOfStatementNfa(cell.value), cell)
        this.statementsNfa[cell.id] = cell

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
/*        statement.value.push(value)
        let set: Set<statement> = new Set()
        statement.value.forEach(value => set.add(value))
        statement.value = []
        set.forEach((value: statement) => statement.value.push(value))*/
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
                this.matrix[i][eps].id = this.getIdStatementsNfa(this.matrix[i][eps].value)
                this.matrix[i][eps].isAdmit = this.isAdmitStatementNfa(this.matrix[i][eps].value)
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
/*                    console.log('       ',secondEpsilon)
                    console.log(i)*/
                    secondEpsilon.forEach(value => {
                        if (this.matrix[i][j].id === -1) {
                            this.matrix[i][j].value = []
                            this.pushValueStatmentNfa(this.matrix[i][j], value)
                            //  cell.value.push(statementNumberTo)
                            this.matrix[i][j].id = this.getIdStatementsNfa(this.matrix[i][j].value)
                            this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)
                        } else {

                            // cell.value.push(statementNumberTo)


                            this.pushValueStatmentNfa(this.matrix[i][j], value)
                            this.matrix[i][j].id = this.getIdStatementsNfa(this.matrix[i][j].value)
                            this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)

/*                            this.addSts(this.matrix[i][j], [value])
                            this.matrix[i][j].isAdmit = this.isAdmitStatementNfa(this.matrix[i][j].value)*/

                            //console.log('-------------------0', this.matrix[i][j].id)
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

    public haveEpsilon(): boolean {
        return this.alphabet.get('Epsilon') !== undefined
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
        console.log('GROUP------------*-*-*-*')
       // computational.statements.forEach(value => console.log(value))
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
        /*computational.statements.forEach(value => console.log(value))*/
        console.log('/*/*')
        // console.log([0,1,2,4,7].toString().indexOf([1,2,4].toString()))
        let statementsRet: statementNfa[] = []
        computational.statements.forEach(value => {
            if (value.id !== -1) {
                statementsRet.push(value)
            }
        })
        statementsRet.forEach(value => console.log(value))
        console.log('<3')
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
        console.log('<3<3<3<3<3<3<3<3<3<3')
        matrixRet.forEach(value => {
            value.forEach(value1 => console.log(value1))
            console.log(' ')
        })
        console.log('<3<3<3<3<3<3<3<3<3<3')
/*        statementsRet.forEach(value => {
            let cur: number[] = []
            value.value.forEach(value1 => cur.push(value1.idLogic))
            let isExist: boolean = false
            for (let i = 0; i < matrixRet.length; i++) {
                //if (matrixRet.... === ....) ПЕРЕСЧИТАЙ ВСЕ ИД ДЛЯ НОВОГО
                for (let j = 0; j < matrixRet[i].length; j++) {
                    let tmp: number[] = []
                    matrixRet[i][j].value.forEach(value1 => tmp.push(value1.idLogic))
                    if (statementsRet[j].id != -1 && cur.toString().indexOf(tmp.toString()) !== -1) {
                        isExist = true
                        break;
                    }
                }
                if (!isExist) {
                    value.id = -1
                }
            }
        })*/

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

        console.log('/*/*---')
        // console.log([0,1,2,4,7].toString().indexOf([1,2,4].toString()))
        matrixRet.forEach(value => {
            value.forEach(value1 => console.log(value1))
            console.log(' ')
        })
        console.log('/*/*---')
        statementsRet.forEach(value => {
            console.log(value)
        })
        console.log('...')

       return {statements: statementsRet, matrix: matrixRet}
    }

    private createSmallMatrix(): computational {
        let eps: number | undefined = this.alphabet.get(EPS)
        let matrix: statementNfa[][] = []
        let statements: statementNfa[] = []
        let set: Set<number> = new Set<number>()
/*
        let map: Map<number, statementNfa> = new Map<number, statementNfa>()
        let id: number = 0
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[i][eps].id !== -1 && this.matrix[i][eps].value.length !== 0) { //if isNot eof* (eof && newEof)
                set.add(this.matrix[i][eps].id)
                if (set.size > statements.length) {
                    statements.push(this.matrix[i][eps])
                    statements[id].id = id
                    map.set(this.matrix[i][eps].id, statements[id])
                    id++
                }
            }
        }
        //map.forEach((value, key) => console.log(key, '->', value))
        for (let i = 0; i < this.matrix.length; i++) {
            if (this.matrix[i][eps].id !== -1 && this.matrix[i][eps].value.length !== 0) { //if isNot eof* (eof && newEof)
                set.add(this.matrix[i][eps].id)
                if (set.size > statements.length) {
                    let temp: statementNfa[] = []
                    for (let j = 0; j < this.matrix[i].length; j++) {
                        if (j != eps) {
                            temp.push(map.get(this.matrix[i][j].id)!)
                        }
                    }
                    matrix.push(temp)
                }
            }
        }*/
        console.log('-()--()--()--()--()-')
        this.matrix.forEach(value => {
            value.forEach(value1 => console.log(value1))
            console.log(' ')
        })
/*        console.log('-()--()--()--()--()-')
        this.statementsNfa.forEach(value => console.log(value))
        console.log('-()--()--()--()--()-')*/

        for (let i = 0; i < this.matrix.length; i++) {
            if (eps !== undefined && this.matrix[i][eps].id !== -1 && this.matrix[i][eps].value.length !== 0) { //if isNot eof* (eof && newEof)
                set.add(this.matrix[i][eps].id)
                if (set.size > statements.length) {
                    statements.push(this.matrix[i][eps])
                    let temp: statementNfa[] = []
                    for (let j = 0; j < this.matrix[i].length; j++) {
                        if (j != eps) {
                            temp.push(this.matrix[i][j])
                        }
                    }
                    matrix.push(temp)
                }
            }
        }

/*        console.log('()()()()()()()()()()()()()()')
        matrix.forEach(value => {
            value.forEach(value1 => console.log(value1))
            console.log(' ')
        })
        console.log('()()()()()()()()()()()()()()')
        statements.forEach(value => console.log(value))
        console.log('()()()()()()()()()()()()()()')*/

        return {matrix: matrix, statements: statements}
    }

    startStatementNfa(): statementNfa {
        let id: number = 0
        for (let i = 0; i < this.statementsNfa.length; i++) {
            for (let j = 0; j < this.statementsNfa[i].value.length; j++) {
                if (this.statementsNfa[i].value[j] === this.statements.get(this.startStatement.id)) {
                    id = i
                   // console.log(this.statementsNfa[i].value[j],'-' , this.statements.get(this.startStatement.id))
                }
            }
        }
       // console.log(this.startStatement, this.statementsNfa[id])
        return this.statementsNfa[id]
    }

    constructor(graph: GraphCore, startStatement: NodeCore, input: string[]) {
        super(graph, startStatement)
        this.setInput(input)
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
            //this.deleteEpsilonColumn()
        }

        this.nfaToDfa()
        this.correctionEmptyNodes()

        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])]

        let isVisited: boolean[] = []
        let ret: statementNfa[] = []
        this.statementsNfa.forEach(value => isVisited.push(false))
        this.createSmallMatrix000(this.currentNodeNfa, this.matrix, isVisited, ret)

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
        this.currentNodeNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])] //this.startStatementNfa()
        this.counterSteps = 0
    }

    public step(): Step {
        if (this.input.length === 0) {
            this.setInput([EPS])
            //return this.toSteps(this.startStatementNfa(), 0)
        }
        if (this.counterSteps >= this.input.length || !this.isPossibleTransition(this.input[this.counterSteps].value)) {
            return this.toSteps(this.currentNodeNfa, this.counterSteps)
        }
        let transformedInput: number = this.alphabet.get(this.input[this.counterSteps].value)
        if (this.input[0].value !== EPS) {
            this.counterSteps++
        }
        this.currentNodeNfa = this.matrix[this.currentNodeNfa.id][transformedInput]
        return this.toSteps(this.currentNodeNfa, this.counterSteps)
    }

    public getTrendyNode(): Step {
        return this.toSteps(this.currentNodeNfa, this.counterSteps)
    }

    public run(): Step {
        if (this.input.length === 0) {
/*            console.log("!!!")*/
            this.setInput([EPS])
        }
        this.counterStepsForResult = 0
        let current: statementNfa = this.statementsNfa[this.getIdStatementsNfa([this.statements.get(this.startStatement.id)])]//this.startStatementNfa()
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
        while (l < this.input.length && this.input[0].value !== EPS) {
            j = this.input[l].idLogic
/*            if (j > this.alphabet.get(EPS)) {
                j--
            }*/
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

    public isDeterministic(): boolean {
        return this.statementsNfa.length === this.statements.size
    }

    private createSmallMatrix000(statement: statementNfa, matrix: statementNfa[][], isVisited: boolean[], ret: statementNfa[]): void {
        isVisited[statement.id] = true
        ret.push(this.statementsNfa[statement.id])
        for (let i = 0; i < matrix[statement.id].length; i++) {
            if (!isVisited[matrix[statement.id][i].id] && matrix[statement.id][i].id !== -1) {
                //console.log(matrix[statement.id][i].id], )
                this.createSmallMatrix000(matrix[statement.id][i], matrix, isVisited, ret)
            }
        }
    }
}


