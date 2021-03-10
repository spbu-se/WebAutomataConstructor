import {DFA} from "./DFA";

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
                {from: 1, to: -100, value: ['0', 'a']},
                {from: -100, to: 44, value: ['a']}
            ]
        }, {id: 1, isAdmit: false}, ['a', 'a'])

    expect(dfa.isAdmit()).toBe(true)
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
                {from: 1, to: -100, value: ['0', 'a']},
                {from: -100, to: 44, value: ['a']}
            ]
        }, {id: 1, isAdmit: false}, ['0'])

    expect(dfa.isAdmit()).toBe(false)
})

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 6 steps for 2 edges without loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, value: ['0', 'a']},
                {from: -100, to: 44, value: ['a']}
            ]
        }, {id: 1, isAdmit: false}, ['a', 'a', 'a', 'a', '0', 'a'])

    expect(dfa.isAdmit()).toBe(false)
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
                {from: 1, to: -100, value: ['0', '1']},
                {from: -100, to: 44, value: ['a']},
                {from: 44, to: 44, value: ['z']}
            ]
        }, {id: 1, isAdmit: false}, ['1', 'a', 'z', 'z', 'z', 'z'])

    expect(dfa.isAdmit()).toBe(true)
})

test("{ q0; A = {0}}: statement without edges", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [

            ]
        }, {id: 1, isAdmit: false}, ['1', 'a', 'z', 'z', 'z', 'z'])
    expect(dfa.isAdmit()).toBe(false)
})

test("{ (q0)<-; A = {0}}: statement with loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, value: ['z']}
            ]
        }, {id: 1, isAdmit: false}, ['z', 'z', 'z', 'z'])

    expect(dfa.isAdmit()).toBe(true)
})

test("{ (q0)<=>q1; A = {0}}: is input length divided at 2", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: -100, isAdmit: false},
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: -100, to: 1, value: ['z']},
                {from: 1, to: -100, value: ['z']}
            ]
        }, {id: 1, isAdmit: true}, ['z', 'z', 'z', 'z'])

    expect(dfa.isAdmit()).toBe(true)
})
