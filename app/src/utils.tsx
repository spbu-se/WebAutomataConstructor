import {ComputerInfo, ComputerType, graph} from "./react-graph-vis-types";
import {EPS} from "./Logic/Computer";
import {Move, TransitionParams} from "./Logic/IGraphTypes";
import { Elements } from "./App";

export const transitionsToLabel = (transitions: Set<TransitionParams[]>): string => {
    const maxLength = (): number => {
        let max: number = 0;
        if (transitions !== undefined) {
            transitions.forEach(value => {
                value.forEach(value1 => {
                    if (value1.stackDown !== undefined && value1.stackPush !== undefined) {
                        const phs: number = Math.max(...value1.stackPush.map(o => o === EPS ? 0 : o.length), 0)
                        const ttl: number = value1.title === EPS ? 0 : value1.title.length
                        const std: number = value1.stackDown === EPS ? 0 : value1.stackDown.length
                        max = Math.max(...[phs, ttl, std, max].map(o => o), 0)
                    }
                })
            })
        }
        return max
    }

    let spc = ""
    const pdng_k = 7

    for (let i = 0; i < maxLength() * pdng_k ; i++) {
        spc += " "
    }

    let str = "" + spc
    if (transitions !== undefined) {
        transitions.forEach(value => {
            value.forEach(value1 => {
                if (value1.title !== undefined && value1.title.length > 0) {
                    if (value1.move !== undefined) {
                        if (value1.stackDown !== undefined && value1.stackDown.length > 0) {
                            str += value1.stackDown === EPS ? "ε" : value1.stackDown
                            // value1.stackDown
                        }
                        if (value1.stackPush !== undefined && value1.stackPush.length > 0 && value1.stackDown !== '') {
                            str += " | " + value1.stackPush.map(value2 => value2 === EPS ? "ε" : value2).join(":")
                        }
                        str += (value1.move === 0 ? "L" : "R")
                    } else {
                        str += value1.title === EPS ? "ε" : value1.title
                        if (value1.stackDown !== undefined && value1.stackDown.length > 0) {
                            str += ", " + (value1.stackDown === EPS ? "ε" : value1.stackDown)
                            // value1.stackDown
                        }
                        if (value1.stackPush !== undefined && value1.stackPush.length > 0 && value1.stackDown !== '') {
                            str += " | " + value1.stackPush.map(value2 => value2 === EPS ? "ε" : value2).join(":")
                        }
                        if (value1.move !== undefined) {
                            str += (value1.move === 0 ? "L" : "R")
                        }
                    }

                    str = str + "\n" + spc
                }
            })

        })
    }
    return str
}

export const getTransitionsTitles = (transitions: Set<TransitionParams[]>): string => {
    let str = ""
    transitions.forEach(value => {
        value.forEach(value1 => {

            if (value1.title !== undefined && value1.title.length > 0) {
                if (value1.move !== undefined) {
                    if (value1.stackDown !== undefined && value1.stackDown.length > 0) {
                        str += value1.stackDown === EPS ? "eps" : value1.stackDown
                    }
                    if (value1.stackPush !== undefined && value1.stackPush.length > 0 && value1.stackDown !== '') {
                        str += " | " + value1.stackPush.map(value2 => value2 === EPS ? "eps" : value2).join(":")
                    }
                    str += ">" + (value1.move === 0 ? "L" : "R")

                } else {
                    str += value1.title === EPS ? "eps" : value1.title
                    if (value1.stackDown !== undefined && value1.stackDown.length > 0) {
                        str += ", " + (value1.stackDown === EPS ? "eps" : value1.stackDown)
                    }
                    if (value1.stackPush !== undefined && value1.stackPush.length > 0 && value1.stackDown !== '') {
                        str += " | " + value1.stackPush.map(value2 => value2 === EPS ? "eps" : value2).join(":")
                    }
                }

                str += ";\n"
            }
        })
    })
    return str
}

export const decorateGraph = (elements: Elements) => {
    elements.edges.forEach((edge) => {
        elements.edges.update({
            id: edge.id!,
            label: transitionsToLabel(edge.transitions)
        })
    })

    elements.nodes.forEach((node) => {
        const border = node.isInitial ? "#0041d0" : node.isAdmit ? "#ff0072" : "#000000"
        const background = node.isCurrent ? "#ffff55" : "#ffffff";
        const borderWidth = {
            default: 1.5,
            primary: 2,
            highlight: 4
        };

        elements.nodes.update({
            id: node.id,
            color: {
                background: background,
                border: border,
                highlight: {
                    border: border,
                    background: background
                }
            },
            borderWidth: node.isInitial || node.isAdmit ? borderWidth.primary : borderWidth.default,
            borderWidthSelected: borderWidth.highlight
        })
    })

}

export const elementsToGraph = (elements: Elements): graph => {
    let acc: graph = {nodes: [], edges: []}

    elements.nodes.forEach((node) => {
        acc.nodes.push(node)
    })
    elements.edges.forEach((edge) => {
        acc.edges.push(edge)
    })

    return acc
}

export const getNodeNamePrefix = (graph: graph): string => {
    let prefix = graph.nodes.length === 0 ? "" : graph.nodes[0].label;

    graph.nodes.forEach(node => {
        let i = 0;
        while (i < node.label.length && i < prefix.length && node.label[i] === prefix[i]) {
            i++;
        }
        prefix = prefix.substring(0, i);
    });

    return prefix;
}

export const computersInfo: Record<ComputerType, ComputerInfo> = {
    dfa: {
        name: "ДКА",
        description: "Конечный автомат, принимающий или отклоняющий заданную строку символов",
        preview: "dfa.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 20, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 200, y: 0, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                // {id: 3, x: 0, y: 180, label: "S2", isAdmit: true, isInitial: false, isCurrent: false},
                // {id: 4, x: 180, y: 200, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 2, transitions: new Set([[{title: "0"}]])},
                // {from: 2, to: 1, transitions: new Set([[{title: "0"}]])},
                // {from: 3, to: 4, transitions: new Set([[{title: "0"}]])},
                // {from: 4, to: 4, transitions: new Set([[{title: "0"}]])},
                // {from: 1, to: 3, transitions: new Set([[{title: "1"}]])},
                // {from: 2, to: 4, transitions: new Set([[{title: "1"}]])},
                // {from: 3, to: 2, transitions: new Set([[{title: "1"}]])},
                // {from: 4, to: 2, transitions: new Set([[{title: "1"}]])},
            ]
        }
    },
    nfa: {
        name: "НКА",
        description: "Может находиться в нескольких состояниях одновременно",
        preview: "nfa.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 100, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 200, y: 200, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 4, x: 300, y: 300, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([[{title: '0'}, {title: '1'}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '1'}]])},

                {from: 1, to: 2, transitions: new Set([[{title: '0'}]])},
                {from: 2, to: 3, transitions: new Set([[{title: '1'}]])},
                {from: 3, to: 4, transitions: new Set([[{title: '1'}]])},

                {from: 4, to: 4, transitions: new Set([[{title: '0'}]])},
                // {from: 4, to: 4, transitions: new Set([[{title: '0'}]])}
            ]
        }
    },
    "nfa-eps": {
        name: "ε-НКА",
        description: "Расширение НКА, в котором используются ε-переходы",
        preview: "nfa-eps.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 100, label: "S", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 100, label: "A1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 100, y: 200, label: "B1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 4, x: 200, y: 100, label: "A2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 5, x: 300, y: 100, label: "A3", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 6, x: 400, y: 100, label: "A4", isAdmit: true, isInitial: false, isCurrent: false},
                {id: 7, x: 200, y: 200, label: "B2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 8, x: 300, y: 200, label: "B3", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 9, x: 400, y: 200, label: "B4", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([[{title: '0'}, {title: '1'}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '1'}]])},

                {from: 1, to: 2, transitions: new Set([[{title: EPS}]])},
                {from: 1, to: 3, transitions: new Set([[{title: EPS}]])},
                {from: 2, to: 4, transitions: new Set([[{title: '0'}]])},
                {from: 4, to: 5, transitions: new Set([[{title: '1'}]])},
                {from: 5, to: 6, transitions: new Set([[{title: '1'}]])},
                {from: 3, to: 7, transitions: new Set([[{title: '1'}]])},
                {from: 7, to: 8, transitions: new Set([[{title: '0'}]])},
                {from: 8, to: 9, transitions: new Set([[{title: '1'}]])},

                {from: 9, to: 9, transitions: new Set([[{title: '0'}, {title: '1'}]])},
                // {from: 9, to: 9, transitions: new Set([[{title: '1'}]])},

                {from: 6, to: 6, transitions: new Set([[{title: '0'}, {title: '1'}]])},
                // {from: 6, to: 6, transitions: new Set([[{title: '1'}]])},

            ]
        }
    },
    pda: {
        name: "МП",
        description: "Использует стек для хранения состояний",
        preview: "pda.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 0, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 200, y: 0, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
            ],
            edges: [
                {
                    from: 1, to: 1, transitions: new Set([
                        [
                            {title: '0', stackDown: 'Z0', stackPush: ['0', 'Z0']},
                            {title: '1', stackDown: 'Z0', stackPush: ['1', 'Z0']},
                            {title: '0', stackDown: '0', stackPush: ['0', '0']},
                            {title: '0', stackDown: '1', stackPush: ['0', '1']},
                            {title: '1', stackDown: '0', stackPush: ['1', '0']},
                            {title: '1', stackDown: '1', stackPush: ['1', '1']}
                        ]])
                },

                // {from: 1, to: 1, transitions: new Set([[{title: '1',  stackDown: 'Z0', stackPush: ['1', 'Z0']}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '0',  stackDown: '0',  stackPush: ['0', '0' ]}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '0',  stackDown: '1',  stackPush: ['0', '1' ]}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '1',  stackDown: '0',  stackPush: ['1', '0' ]}]])},
                // {from: 1, to: 1, transitions: new Set([[{title: '1',  stackDown: '1',  stackPush: ['1', '1' ]}]])},

                {
                    from: 1, to: 2, transitions: new Set([
                        [
                            {title: EPS, stackDown: 'Z0', stackPush: ['Z0']},
                            {title: EPS, stackDown: '0', stackPush: ['0']},
                            {title: EPS, stackDown: '1', stackPush: ['1']}
                        ]])
                },
                // {from: 1, to: 2, transitions: new Set([[{title: EPS,  stackDown: '0',  stackPush: ['0'      ]}]])},
                // {from: 1, to: 2, transitions: new Set([[{title: EPS,  stackDown: '1',  stackPush: ['1'      ]}]])},

                {
                    from: 2, to: 2, transitions: new Set([
                        [
                            {title: '0', stackDown: '0', stackPush: [EPS]},
                            {title: '1', stackDown: '1', stackPush: [EPS]}
                        ]])
                },
                // {from: 2, to: 2, transitions: new Set([[{title: '1',  stackDown: '1',  stackPush: [EPS      ]}]])},

                {from: 2, to: 3, transitions: new Set([[{title: EPS, stackDown: 'Z0', stackPush: [EPS]}]])},

            ]
        }
    },
    tm: {
        name: "Машина Тьюринга",
        description: "_",
        preview: "_.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 20, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 200, y: 0, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 0, y: 180, label: "S2", isAdmit: true, isInitial: false, isCurrent: false},
                {id: 4, x: 180, y: 200, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                { from: 1, to: 1, transitions: new Set([[{title: EPS, stackDown: '0', stackPush: ['0'], move: Move.R}, {title: EPS, stackDown: '1', stackPush: ['1'], move: Move.R} ]]) },
                { from: 1, to: 2, transitions: new Set([[{title: EPS, stackDown: '_', stackPush: ['_'], move: Move.L} ]]) },
                { from: 2, to: 2, transitions: new Set([[{title: EPS, stackDown: '1', stackPush: ['0'], move: Move.L} ]]) },
                { from: 2, to: 3, transitions: new Set([[{title: EPS, stackDown: '0', stackPush: ['1'], move: Move.L} ]]) },
                { from: 2, to: 4, transitions: new Set([[{title: EPS, stackDown: '_', stackPush: ['1'], move: Move.L} ]]) },
            ]
        }
    },


}

export const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}


export const getRandomString = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}