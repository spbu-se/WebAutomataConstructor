import { DFA } from "../DFA";
import { EpsilonNFA } from "../EpsilonNFA";
import { Mealy } from "../Mealy";
import { Moore } from "../Moore";
import { testFunc } from "./utils";

export { }

test("mealy-moore conversions", () => {
    let computer = new Mealy(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
                { id: 4, isAdmit: false }
            ],
            edges: [
                { from: 1, to: 1, transitions: new Set([[{ title: 'a', output: '1' }]]) },
                { from: 1, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },

                { from: 2, to: 4, transitions: new Set([[{ title: 'a', output: '1' }, { title: 'b', output: '1' }]]) },

                { from: 3, to: 3, transitions: new Set([[{ title: 'b', output: '1' }]]) },
                { from: 3, to: 2, transitions: new Set([[{ title: 'a', output: '1' }]]) },

                { from: 4, to: 1, transitions: new Set([[{ title: 'b', output: '1' }]]) },
                { from: 4, to: 3, transitions: new Set([[{ title: 'a', output: '0' }]]) },

            ]
        }, [{ id: 1, isAdmit: false }], ['a', 'b', 'a', 'b'])

    const _moore = computer.mealyToMoore()

    const moore = new Moore({
        nodes: _moore.graphcore.nodes,
        edges: _moore.graphcore.edges
    }, _moore.start, ['a', 'b', 'a', 'b'])

    const _mealy = moore.mooreToMealy()

    const mealy = new Mealy({
        nodes: _mealy.graphcore.nodes,
        edges: _mealy.graphcore.edges
    }, _mealy.start, ['a', 'b', 'a', 'b'])

    const _moore_ = mealy.mealyToMoore()

    expect(JSON.stringify(_moore.graphcore.edges.map((v) => ({ from: v.from, to: v.to }))))
        .toBe(JSON.stringify([
            { from: 1, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 1 },
            { from: 3, to: 6 },
            { from: 4, to: 4 },
            { from: 4, to: 5 },
            { from: 5, to: 3 },
            { from: 6, to: 4 },
            { from: 6, to: 5 },
        ]))
})

test("NFA->DFA", () => {
    let computer = new Mealy(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
                { id: 4, isAdmit: false }
            ],
            edges: [
                { from: 1, to: 1, transitions: new Set([[{ title: 'a', output: '1' }]]) },
                { from: 1, to: 2, transitions: new Set([[{ title: 'b', output: '0' }]]) },

                { from: 2, to: 4, transitions: new Set([[{ title: 'a', output: '1' }, { title: 'b', output: '1' }]]) },

                { from: 3, to: 3, transitions: new Set([[{ title: 'b', output: '1' }]]) },
                { from: 3, to: 2, transitions: new Set([[{ title: 'a', output: '1' }]]) },

                { from: 4, to: 1, transitions: new Set([[{ title: 'b', output: '1' }]]) },
                { from: 4, to: 3, transitions: new Set([[{ title: 'a', output: '0' }]]) },

            ]
        }, [{ id: 1, isAdmit: false }], ['a', 'b', 'a', 'b'])

    const _moore = computer.mealyToMoore()

    const moore = new Moore({
        nodes: _moore.graphcore.nodes,
        edges: _moore.graphcore.edges
    }, _moore.start, ['a', 'b', 'a', 'b'])

    const _mealy = moore.mooreToMealy()

    const mealy = new Mealy({
        nodes: _mealy.graphcore.nodes,
        edges: _mealy.graphcore.edges
    }, _mealy.start, ['a', 'b', 'a', 'b'])

    const _moore_ = mealy.mealyToMoore()

    expect(JSON.stringify(_moore.graphcore.edges.map((v) => ({ from: v.from, to: v.to }))))
        .toBe(JSON.stringify([
            { from: 1, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 1 },
            { from: 3, to: 6 },
            { from: 4, to: 4 },
            { from: 4, to: 5 },
            { from: 5, to: 3 },
            { from: 6, to: 4 },
            { from: 6, to: 5 },
        ]))
})

test("NFA->DFA:", () => {

    let nfa = new EpsilonNFA(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
                { id: 4, isAdmit: true },
            ],
            edges: [
                { from: 1, to: 2, transitions: new Set([[{ title: '0' }, { title: '1' }]]) },
                { from: 2, to: 3, transitions: new Set([[{ title: '0' }]]) },
                { from: 3, to: 4, transitions: new Set([[{ title: '1' }]]) },
                { from: 4, to: 4, transitions: new Set([[{ title: '1' }, { title: '0' }]]) },
            ]
        }, [{ id: 1, isAdmit: false }], ['0', '1', '0', '1', '0', '0', '0', '0', '0', '0', '0'])

    const dfa = nfa.nfaToDfa()

    expect(JSON.stringify(dfa.edges.map((v) => ({ from: v.from, to: v.to }))))
        .toBe(JSON.stringify([
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 3 },
        ]))
})

test("minimize DFA:", () => {

    const dfa = new DFA(
        {
            nodes: [
                { id: 0, isAdmit: false },
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
                { id: 4, isAdmit: true },
                { id: 5, isAdmit: true },
                { id: 6, isAdmit: false },
            ],
            edges: [
                { from: 0, to: 1, transitions: new Set([[{ title: 'a' }]]) },
                { from: 0, to: 2, transitions: new Set([[{ title: 'b' }]]) },

                { from: 1, to: 3, transitions: new Set([[{ title: 'a' }]]) },
                { from: 1, to: 4, transitions: new Set([[{ title: 'b' }]]) },

                { from: 2, to: 3, transitions: new Set([[{ title: 'a' }]]) },
                { from: 2, to: 5, transitions: new Set([[{ title: 'b' }]]) },

                { from: 3, to: 3, transitions: new Set([[{ title: 'a' }, { title: 'b' }]]) },

                { from: 4, to: 4, transitions: new Set([[{ title: 'a' }]]) },
                { from: 4, to: 6, transitions: new Set([[{ title: 'b' }]]) },

                { from: 5, to: 5, transitions: new Set([[{ title: 'a' }]]) },
                { from: 5, to: 6, transitions: new Set([[{ title: 'b' }]]) },

                { from: 6, to: 6, transitions: new Set([[{ title: 'a' }, { title: 'b' }]]) },
            ]
        }, [{ id: 0, isAdmit: false }], ['a'])

    const dfaMin = dfa.minimizeDfa()

    expect(JSON.stringify(dfaMin.graphcore.edges.map((v) => ({ from: v.from, to: v.to }))))
        .toBe(JSON.stringify([
            { from: 1, to: 1 },
            { from: 1, to: 4 },
            { from: 2, to: 3 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 3, to: 1 },
            { from: 4, to: 4 },
            { from: 4, to: 4 },
        ]))
})
