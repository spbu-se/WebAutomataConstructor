import {DFA} from "../DFA";
import {Step} from "../Types";
import {NFA} from "../NFA";
import { Computer } from "../Computer";

export {}

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 2 steps for 2 edges without loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: 'a'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['a', 'a'])

    let result = {node: {id: 44, isAdmit: true}, counter: 2}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 1 steps for 2 edges without loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: 'a'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0'])

    let result = {node: {id: -100, isAdmit: false}, counter: 1}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})


test("{ q0 -> q1 -> (q2)<-; A = {0, 1}}: 6 steps for 2 edges with loop in q2", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: '1'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
                {from: 44, to: 44, transitions: new Set([ [{ title: 'z'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['1', 'a', 'z', 'z', 'z', 'z'])

    let result = {node: {id: 44, isAdmit: true}, counter: 6}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})

test("{ (q0)<-; A = {0}}: statement with loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([ [{ title: 'z'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['z', 'z', 'z', 'z'])

    let result = {node: {id: 1, isAdmit: true}, counter: 4}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})

test("{ (q0)<=>q1; A = {0}}: is input length divided at 2", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: -100, isAdmit: false},
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: -100, to: 1, transitions: new Set([ [{ title: 'z'}]])},
                {from: 1, to: -100, transitions: new Set([ [{ title: 'z'}]])},
            ]
        }, [{id: 1, isAdmit: true}], ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'])

    let result = {node: {id: 1, isAdmit: true}, counter: 10}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})


let testFunc = (nfa: Computer): Step => {
    for (let i = 0; i < nfa.input.length - 1; i++) {
        nfa.step()
    }
    return nfa.step()
}

test("step by step: { q0 -> q1 -> (q2); A = {0, 1}}: 2 steps for 2 edges without loop", () => {

    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [

                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: 'a'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
                
            ]
        }, [{id: 1, isAdmit: false}], ['0', 'a'])

    let result = testFunc(dfa)
    dfa.restart()

    expect(result.nodes[0].id === dfa.run().nodes[0].id)
        .toBe(true)
})

test("step by step: { q0 -> q1 -> (q2); A = {0, 1}}: 1 steps for 2 edges without loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: 'a'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['0'])

    let result = testFunc(dfa)
    dfa.restart()

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})



test("step by step: { q0 -> q1 -> (q2)<-; A = {0, 1}}: 6 steps for 2 edges with loop in q2", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: new Set([ [{ title: '0'}, { title: '1'}]])},
                {from: -100, to: 44, transitions: new Set([ [{ title: 'a'}]])},
                {from: 44, to: 44, transitions: new Set([ [{ title: 'z'}]])},
            ]
        }, [{id: 1, isAdmit: false}], ['1', 'a', 'z', 'z', 'z', 'z'])

    let result = testFunc(dfa)
    dfa.restart()

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})


test("step by step: a{(q0)<=>q1; A = {0}}: is input length divided at 2", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: -100, isAdmit: false},
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: -100, to: 1, transitions: new Set([ [{ title: 'z'}]])},
                {from: 1, to: -100, transitions: new Set([ [{ title: 'z'}]])},
            ]
        }, [{id: 1, isAdmit: true}], ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'])

    let result = testFunc(dfa)
    dfa.restart()

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})
