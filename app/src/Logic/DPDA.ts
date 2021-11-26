import {History, statement, Step} from "./Types";
import {GraphCore, Move, NodeCore} from "./IGraphTypes";
import {BOTTOM, Computer, EPS} from "./Computer";
import {Stack} from "./Stack";
import {PDA} from "./PDA";

type statementCell = {
    readonly stackDown?: string
    readonly stackPush?: string[]
    readonly move?: Move
} & statement

type statementCells = Array<statementCell>

type element = {
    idLogic: number
    top: Stack<string>
}

type position = {
    stmt: statement,
    stack?: Stack<string>
}

export class DPDA extends PDA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        this.setInput(input)
        if (!super.isDeterministic()) {
            throw new Error("Is not determenistic")
        }
    }

}
