import {Step} from "../Types";
import {NFA} from "../NFA";
import { Computer } from "../Computer";
import { testFunc } from "./utils";

export {}

let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}


test("step by step: { q0 <- -> q1 -> (q2); A = {0, 1}}: 1 steps for 2 edges with loop", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([[{ title: '0'}, { title: '1'}]])},
                {from: 1, to: 2, transitions: new Set([[{ title: '0'}]])},
                {from: 2, to: 3, transitions: new Set([[{ title: '0'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step: { q0 <- -> q1 -> (q2); A = {0, 1}}: 2 steps for 2 edges with loop", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([[{ title: '0'}, { title: '1'}]])},
                {from: 1, to: 2, transitions: new Set([[{ title: '0'}]])},
                {from: 2, to: 3, transitions: new Set([[{ title: '0'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0', '0'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 0, isAdmit: false},
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: true},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 0, to: 1, transitions: new Set([[{ title: 'a'}]])},
                {from: 1, to: 2, transitions: new Set([[{ title: 'b'}]])},
                {from: 0, to: 3, transitions: new Set([[{ title: 'a'}]])},
            ]
        }, [{id: 0, isAdmit: false}], ['a'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})


test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 0, isAdmit: false},
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: true},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 0, to: 1, transitions: new Set([[{ title: 'a'}]])},
                {from: 1, to: 2, transitions: new Set([[{ title: 'b'}]])},
                {from: 0, to: 3, transitions: new Set([[{ title: 'a'}]])},
            ]
        }, [{id: 0, isAdmit: false}], ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 0, isAdmit: false},
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: true},
                {id: 3, isAdmit: true},
            ],
            edges: [
                {from: 0, to: 1, transitions: new Set([[{ title: 'a'}]])},
                {from: 1, to: 2, transitions: new Set([[{ title: 'b'}]])},
                {from: 0, to: 3, transitions: new Set([[{ title: 'a'}]])},
            ]
        }, [{id: 0, isAdmit: false}], ['b', 'b'])

    let result = testFunc(nfa)

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: false},
                {id: 4, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 2, transitions: new Set([ [{ title: '0'}, { title: '1'}]])},
                {from: 2, to: 3, transitions: new Set([[{ title: '0'}]])},
                {from: 3, to: 4, transitions: new Set([[{ title: '1'}]])},
                {from: 4, to: 4, transitions: new Set([[{ title: '0'}, { title: '1'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0', '1', '1', '0','0'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: false},
                {id: 4, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 2, transitions: new Set([ [{ title: '0'}, { title: '1'}]])},
                {from: 2, to: 3, transitions: new Set([[{ title: '0'}]])},
                {from: 3, to: 4, transitions: new Set([[{ title: '1'}]])},
                {from: 4, to: 4, transitions: new Set([[{ title: '0'}, { title: '1'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0','1','0','1','0','0','0','0','0','0','0'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})

test("step by step:", () => {

    let nfa = new NFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: 2, isAdmit: false},
                {id: 3, isAdmit: false},
                {id: 4, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 2, transitions: new Set([ [{ title: '0'}, { title: '1'}]])},
                {from: 2, to: 3, transitions: new Set([[{ title: '0'}]])},
                {from: 3, to: 4, transitions: new Set([[{ title: '1'}]])},
                {from: 4, to: 4, transitions: new Set([[{ title: '0'}, { title: '1'}]])},
            ]
        }, [{id: 3, isAdmit: false}], ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'])

    let result = testFunc(nfa)
    nfa.restart()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(nfa.run().nodes))
})