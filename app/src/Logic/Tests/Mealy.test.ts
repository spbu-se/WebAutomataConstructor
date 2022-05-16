import { Mealy } from "../Mealy";
import { testFunc } from "./utils";

export { }


test("by statement", () => {

    let computer = new Mealy(
        {
            nodes: [
                { id: 0, isAdmit: false },
                { id: 1, isAdmit: false },
            ],
            edges: [
                { from: 0, to: 0, transitions: new Set([[{ title: '5', output: 'n' }]]) },
                { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
            ]
        }, [{ id: 0, isAdmit: false }], ['5'])

    const result = testFunc(computer)

    computer.restart()

    const run = computer.run()

    console.log(result.nodes.map((v) => v.output))

    expect(JSON.stringify(result.nodes.map((v) => v.output)))
        .toBe(JSON.stringify(['n', 'n']))
})

test("by statement", () => {
    let computer = new Mealy(
        {
            nodes: [
                { id: 1, isAdmit: false },
                { id: 2, isAdmit: false },
                { id: 3, isAdmit: false },
                { id: 4, isAdmit: false },
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

    const result = testFunc(computer)

    computer.restart()

    const run = computer.run()

    console.log(result.nodes.map((v) => v.output))

    expect(JSON.stringify(result.nodes.map((v) => v.output)))
        .toBe(JSON.stringify(['1']))
})


test("by statement", () => {
    let computer = new Mealy(
            {
                nodes: [
                    { id: 0, isAdmit: false },
                    { id: 1, isAdmit: false },
                    { id: 2, isAdmit: false },
                    { id: 3, isAdmit: false },
                ],
                edges: [
                    { from: 0, to: 1, transitions: new Set([[{ title: '5', output: 'n' }]]) },
                    { from: 0, to: 3, transitions: new Set([[{ title: '10', output: 'n' }]]) },
                    { from: 1, to: 2, transitions: new Set([[{ title: '10', output: 'n' }]]) },
                    { from: 1, to: 3, transitions: new Set([[{ title: '5', output: 'n' }]]) },
                    { from: 2, to: 0, transitions: new Set([[{ title: '5', output: '0' }, { title: '10', output: '5' }]]) },
                    { from: 3, to: 2, transitions: new Set([[{ title: '5', output: 'n' }]]) },
                    { from: 3, to: 0, transitions: new Set([[{ title: '10', output: '0' }]]) },
        
                ]
            }, [{ id: 0, isAdmit: false }], ['5','5', '5', '10'])
        
    const result = testFunc(computer)

    computer.restart()

    const run = computer.run()

    console.log(result.nodes.map((v) => v.output))

    expect(JSON.stringify(result.nodes.map((v) => v.output)))
        .toBe(JSON.stringify(['5']))
})