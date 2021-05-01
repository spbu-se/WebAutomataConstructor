import {statement, statementNfa, Step} from "./Types";
import {GraphCore, NodeCore} from "./IGraphTypes";
import {Computer, eof, EPS} from "./Computer";
import {EpsilonNFA} from "./EpsilonNFA";

export class NFA extends EpsilonNFA {

    constructor(graph: GraphCore, startStatement: NodeCore[], input: string[]) {
        super(graph, startStatement, input)
        if (this.haveEpsilon()) {
            throw new Error('Epsilon Transitions')
        }
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
let nfa = new NFA(
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
    }, {id: 0, isAdmit: false}, ['0'])*/
