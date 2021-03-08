export type statement = {
    id: number
    isAdmit: boolean;
}
export type elementOfAlphabet = number // does we need in func alphabet -> hashedAlphabet  (+ use in input for any element) <T>

export const eof: statement = {id: -1, isAdmit: false}

export class DFA {

    private readonly matrix: statement[][]
    private readonly input: elementOfAlphabet[]
    private readonly alphabet: elementOfAlphabet[]
    private readonly statements: statement[]
    private readonly startStatement

    constructor(statements: statement[], matrix: statement[][], input: elementOfAlphabet[] , alphabet: elementOfAlphabet[]) {
        this.statements = statements
        this.input = input
        this.matrix = matrix
        this.alphabet = alphabet
        this.startStatement = statements[0]
    }

    public firstMatchValue = (current: elementOfAlphabet) : number => { //hash?
        let i = 0;
        while (current !== this.alphabet[i]) {
            i++;
        }
        return i
    }

    public firstMatchStatement = (current: statement) : number => { //hash?
        let i = 0;
        while (current !== this.statements[i]) {
            i++;
        }
        return i
    }

    public isAdmit = () : boolean => {
        let current: statement = this.startStatement
        let oldCurrent = current
        let l = 0
        let i = 0
        let j = -1 //now we see at left column of table of def statements
        console.log('NOW in', current, 'start statement')
        while (l < this.input.length) {
            j = this.firstMatchValue(this.input[l])
            if (this.matrix[i][j] === eof) {
                console.log('FUBAR Aoutomata was stoped in ', oldCurrent, 'because string has only EOF values (noway from this statement)', ' in: ', i, ' ', j)
                return oldCurrent.isAdmit
            }
            oldCurrent = current
            current = this.matrix[i][j]
            console.log('NOW in', current, ' ~ ', i, ' ', j)
            i = this.firstMatchStatement(this.matrix[i][j])
            l++
        }
        console.log('Aoutomata was stoped in ', current, ' ~ ', i, ' ', j)
        return current.isAdmit
    }
}


/*

let q0: statement = {id: 0, isAdmit: false}
let q1: statement = {id: 1, isAdmit: false}
let q2: statement = {id: 2, isAdmit: true}
let matrix: statement[][] = [
    [eof]
]
let dfa = new DFA([q0, q1, q2] ,matrix, [0,  1, 1,1,1], [0])

console.log(dfa.isAdmit())

*/