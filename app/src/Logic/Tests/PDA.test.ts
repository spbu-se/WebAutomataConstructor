import { Step } from "../Types";
import { NFA } from "../NFA";
import { PDA } from "../PDA";
import { Computer, EPS } from "../Computer";
import { EpsilonNFA } from "../EpsilonNFA";
import { testFunc } from "./utils";

export { }


test("by statement", () => {

    let nfa = new PDA(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
            ],
            edges: [
                {
                    from: 1, to: 1, transitions: new Set([
                        [
                            { title: '0', stackDown: 'Z0', stackPush: ['0', 'Z0'] },
                            { title: '1', stackDown: 'Z0', stackPush: ['1', 'Z0'] },
                            { title: '0', stackDown: '0', stackPush: ['0', '0'] },
                            { title: '0', stackDown: '1', stackPush: ['0', '1'] },
                            { title: '1', stackDown: '0', stackPush: ['1', '0'] },
                            { title: '1', stackDown: '1', stackPush: ['1', '1'] }
                        ]])
                },

                {
                    from: 1, to: 2, transitions: new Set([
                        [
                            { title: EPS, stackDown: 'Z0', stackPush: ['Z0'] },
                            { title: EPS, stackDown: '0', stackPush: ['0'] },
                            { title: EPS, stackDown: '1', stackPush: ['1'] }
                        ]])
                },
                {
                    from: 2, to: 2, transitions: new Set([
                        [
                            { title: '0', stackDown: '0', stackPush: [EPS] },
                            { title: '1', stackDown: '1', stackPush: [EPS] }
                        ]])
                },

                { from: 2, to: 3, transitions: new Set([[{ title: EPS, stackDown: 'Z0', stackPush: [EPS] }]]) },
            ]
        },
        [{ id: 1, isAdmit: false }], ['0', '1', '0', '0', '1', '0', '0', '1', '0'],
    )
    const result = testFunc(nfa)


    nfa.restart()

    const run = nfa.run()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(run.nodes))
})

test("by statement", () => {

    let nfa = new PDA(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
            ],
            edges: [
                {
                    from: 1, to: 1, transitions: new Set([
                        [
                            { title: '0', stackDown: 'Z0', stackPush: ['0', 'Z0'] },
                            { title: '1', stackDown: 'Z0', stackPush: ['1', 'Z0'] },
                            { title: '0', stackDown: '0', stackPush: ['0', '0'] },
                            { title: '0', stackDown: '1', stackPush: ['0', '1'] },
                            { title: '1', stackDown: '0', stackPush: ['1', '0'] },
                            { title: '1', stackDown: '1', stackPush: ['1', '1'] }
                        ]])
                },

                {
                    from: 1, to: 2, transitions: new Set([
                        [
                            { title: EPS, stackDown: 'Z0', stackPush: ['Z0'] },
                            { title: EPS, stackDown: '0', stackPush: ['0'] },
                            { title: EPS, stackDown: '1', stackPush: ['1'] }
                        ]])
                },
                {
                    from: 2, to: 2, transitions: new Set([
                        [
                            { title: '0', stackDown: '0', stackPush: [EPS] },
                            { title: '1', stackDown: '1', stackPush: [EPS] }
                        ]])
                },

                { from: 2, to: 3, transitions: new Set([[{ title: EPS, stackDown: 'Z0', stackPush: [EPS] }]]) },
            ]
        },
        [{ id: 1, isAdmit: false }], ['0', '1', '0', '0', '1', '0', '0', '1', '0'], true
    )
    const result = testFunc(nfa)


    nfa.restart()

    const run = nfa.run()

    expect(JSON.stringify(result.nodes))
        .toBe(JSON.stringify(run.nodes))
})