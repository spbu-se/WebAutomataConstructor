import { Mealy } from "../Mealy";
import { Moore } from "../Moore";
import { testFunc } from "./utils";

export { }


test("by statement", () => {

    let computer = new Moore(
        {
            nodes: [
                { id: 0, isAdmit: false, output: 'n' },
                { id: 1, isAdmit: false, output: 'n' },
            ],
            edges: [
                { from: 0, to: 0, transitions: new Set([[{ title: '5' }]]) },
                { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
            ]
        }, [{ id: 0, isAdmit: false }], ['5'])

    const result = testFunc(computer)

    computer.restart()

    console.log(result.nodes.map((v) => v.output))

    expect(JSON.stringify(result.nodes.map((v) => v.output)))
        .toBe(JSON.stringify(['n', 'n']))
})


test("by statement", () => {

    let computer = new Moore(
        {
            nodes: [
                { id: 1, isAdmit: false, output: "b" },
                { id: 2, isAdmit: false, output: "b"  },
                { id: 3, isAdmit: false, output: "a"  },
            ],
            edges: [
                { from: 1, to: 1, transitions: new Set([[{ title: '1' }]]) },
                { from: 1, to: 2, transitions: new Set([[{ title: '0' }]]) },
    
                { from: 2, to: 2, transitions: new Set([[{ title: '0' }]]) },
                { from: 2, to: 3, transitions: new Set([[{ title: '1' }]]) },
    
                { from: 3, to: 2, transitions: new Set([[{ title: '0' }]]) },
                { from: 3, to: 1, transitions: new Set([[{ title: '1' }]]) },
            ]        
        
        }, [{ id: 1, isAdmit: false, output: "b" }], ['1', '0', '0', '1', '1'])

    const result = testFunc(computer)

    computer.restart()

    console.log(result.nodes.map((v) => v.output))

    expect(JSON.stringify(result.nodes.map((v) => v.output)))
        .toBe(JSON.stringify(['b']))
})


