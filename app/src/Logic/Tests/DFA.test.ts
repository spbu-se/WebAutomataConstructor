import {DFA} from "../DFA";
import {Step} from "../Types";

export {}

let toSet = (str: string[]) => {
    let set: Set<string> = new Set()
    for (let i = 0; i < str.length; i++) {
        set.add(str[i])
    }
    return set;
}

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 2 steps for 2 edges without loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['a', 'a'])

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
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['0'])

    let result = {node: {id: -100, isAdmit: false}, counter: 1}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 6 steps for 2 edges without loop.", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['a', 'a', '0', '0', '0', 'a'])


    expect(dfa.run().nodes[0] === undefined)
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
                {from: 1, to: -100, transitions: toSet(['0', '1'])},
                {from: -100, to: 44, transitions: toSet(['a'])},
                {from: 44, to: 44, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: false}, ['1', 'a', 'z', 'z', 'z', 'z'])

    let result = {node: {id: 44, isAdmit: true}, counter: 6}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
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

    let result = {node: {id: 1, isAdmit: false}, counter: 0}

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
                {from: 1, to: 1, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: false}, ['z', 'z', 'z', 'z'])

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
                {from: -100, to: 1, transitions: toSet(['z'])},
                {from: 1, to: -100, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: true}, ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'])

    let result = {node: {id: 1, isAdmit: true}, counter: 10}

    expect(result.node.id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})
let testFunc = (dfa: DFA) : Step => {
    for (let i = 0; i < dfa.input.length; i++) {
        dfa.step()
        //console.log(dfa.getTrendyNode())
    }
    console.log('---------------------------------', dfa.getTrendyNode())
    return dfa.getTrendyNode()
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
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['0', 'a'])

    let result = testFunc(dfa)

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
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
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['0'])

    let result = testFunc(dfa)

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})


test("{ q0 -> q1 -> (q2); A = {0, 1}}: 6 steps for 2 edges without loop - variation", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: false},
                {id: -100, isAdmit: false},
                {id: 44, isAdmit: true},
            ],
            edges: [
                {from: 1, to: -100, transitions: toSet(['0', 'a'])},
                {from: -100, to: 44, transitions: toSet(['a'])}
            ]
        }, {id: 1, isAdmit: false}, ['a', 'a', 'a', 'a', '0', 'a'])

    let result = testFunc(dfa)

    expect(result.nodes.length === 0)
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
                {from: 1, to: -100, transitions: toSet(['0', '1'])},
                {from: -100, to: 44, transitions: toSet(['a'])},
                {from: 44, to: 44, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: false}, ['1', 'a', 'z', 'z', 'z', 'z'])

    let result = testFunc(dfa)

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})


test("step by step: { (q0)<-; A = {0}}: statement with loop", () => {
    let dfa = new DFA(
        {
            nodes: [
                {id: 1, isAdmit: true},
            ],
            edges: [
                {from: 1, to: 1, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: false}, ['z', 'z', 'z', 'z'])

    let result = testFunc(dfa)

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
                {from: -100, to: 1, transitions: toSet(['z'])},
                {from: 1, to: -100, transitions: toSet(['z'])}
            ]
        }, {id: 1, isAdmit: true}, ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'])

    let result = testFunc(dfa)

    expect(result.nodes[0].id === dfa.run().nodes[0].id && result.counter === dfa.run().counter)
        .toBe(true)
})
