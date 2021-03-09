import {DFA, eof, statement} from "./DFA";

export {}

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 2 steps for 2 edges without loop", () => {
    let q0: statement = {id: 0, isAdmit: false}
    let q1: statement = {id: 1, isAdmit: false}
    let q2: statement = {id: 2, isAdmit: true}
    let matrix: statement[][] = [
        [q1, q1],
        [q2, q2],
        [eof, eof]
    ]
    let dfa = new DFA([q0, q1, q2] ,matrix, [0,  1], [0, 1])
    expect(dfa.isAdmit()).toBe(true)
})

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 1 steps for 2 edges without loop", () => {
    let q0: statement = {id: 0, isAdmit: false}
    let q1: statement = {id: 1, isAdmit: false}
    let q2: statement = {id: 2, isAdmit: true}
    let matrix: statement[][] = [
        [q1, q1],
        [q2, q2],
        [eof, eof]
    ]
    let dfa = new DFA([q0, q1, q2] ,matrix, [0], [0, 1])
    expect(dfa.isAdmit()).toBe(false)
})

test("{ q0 -> q1 -> (q2); A = {0, 1}}: 6 steps for 2 edges without loop", () => {
    let q0: statement = {id: 0, isAdmit: false}
    let q1: statement = {id: 1, isAdmit: false}
    let q2: statement = {id: 2, isAdmit: true}
    let matrix: statement[][] = [
        [q1, q1],
        [q2, q2],
        [eof, eof]
    ]
    let dfa = new DFA([q0, q1, q2] ,matrix, [1, 1, 1, 1, 1, 1], [0, 1])
    expect(dfa.isAdmit()).toBe(false)
})

test("{ q0 -> q1 -> (q2)<-; A = {0, 1}}: 6 steps for 2 edges with loop in q2", () => {
    let q0: statement = {id: 0, isAdmit: false}
    let q1: statement = {id: 1, isAdmit: false}
    let q2: statement = {id: 2, isAdmit: true}
    let matrix: statement[][] = [
        [q1, q1],
        [q2, q2],
        [q2, q2]
    ]
    let dfa = new DFA([q0, q1, q2] ,matrix, [1, 1, 1, 1, 1, 1], [0, 1])
    expect(dfa.isAdmit()).toBe(true)
})

test("{ q0; A = {0}}: statement without edges", () => {
    let q0: statement = {id: 0, isAdmit: false}
    let q1: statement = {id: 1, isAdmit: false}
    let q2: statement = {id: 2, isAdmit: true}
    let matrix: statement[][] = [
        [eof]                               //[eof, eof], [eof, eof]  -  working
    ]
    let dfa = new DFA([q0, q1, q2] ,matrix, [0,  0, 0, 1, 0], [0, 1])

    expect(dfa.isAdmit()).toBe(false)
})

test("{ (q0)<-; A = {0}}: statement without edges", () => {
    let q0: statement = {id: 0, isAdmit: true}
    let matrix: statement[][] = [
        [q0]
    ]
    let dfa = new DFA([q0] ,matrix, [0,  0, 0, 0, 0], [0])

    expect(dfa.isAdmit()).toBe(true)
})

test("{ (q0)<=>q1; A = {0}}: is input length divided at 2", () => {
    let q0: statement = {id: 0, isAdmit: true}
    let q1: statement = {id: 1, isAdmit: false}

    let matrix: statement[][] = [
        [q1,q1],
        [q0,q0]
    ]
    let dfa = new DFA([q0, q1] ,matrix, [0, 1, 1, 1], [0, 1])
    expect(dfa.isAdmit()).toBe(true)
})
