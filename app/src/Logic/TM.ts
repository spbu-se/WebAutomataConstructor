import {History, statement, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {BOTTOM, Computer, EPS} from "./Computer";
import {Stack} from "./Stack";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

type statementCell = {
    readonly stackDown?: string
    readonly stackPush?: string[]
} & statement

type statementCells = Array<statementCell>

type element = {
    idLogic: number
    top: Stack<string>
}

type position = {
    stmt: statement,
    stack: Stack<string>
}

class TMMemory {
    private storage: string[] = ['B']
    private pointer: number = 0

    mvRight(curr: string, upd: string): void {
        if (this.storage[this.pointer] === curr) {
            this.storage[this.pointer] = upd
            this.pointer++
        }
        if (this.pointer === this.storage.length) {
            this.storage.push('B')
        }
    }

    mvLeft(curr: string, upd: string): void {
        if (this.pointer === 0) {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd
                this.pointer = 0
            }
            let tmp = ['B']
            this.storage.forEach(value => tmp.push(value))
            this.storage = tmp
        } else {
            if (this.storage[this.pointer] === curr) {
                this.storage[this.pointer] = upd
                this.pointer--
            }
        }
    }


    getStorage(): string[] {
        return this.storage
    }

}

let m = new TMMemory()
m.mvLeft('B', '0')
m.mvLeft('B', '1')
m.mvRight('B', '0')
m.mvRight('1', '2')
m.mvRight('0', '3')


console.log(m.getStorage())

export class TM extends Computer {

    restart = () => {
    }

    run = (): Step => {
        return {nodes: [], isAdmit: false, history: [], counter: 0}
    }

    setInput = (input: string[]) => {
    }

    step = (): Step => {
        return {nodes: [], isAdmit: false, history: [], counter: 0}
    }



}
