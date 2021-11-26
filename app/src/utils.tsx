import {ComputerInfo, ComputerType, graph} from "./react-graph-vis-types";
import {DFA} from "./Logic/DFA";
import {EPS} from "./Logic/Computer";

export const transitionsToLabel = (transitions: Set<string>): string => {
    return Array.from(transitions).map(transition => transition === EPS ? "ε" : transition).join(",");
}

export const decorateGraph = (graph: graph): graph => {
    graph.nodes.forEach(node => {
        const border = node.isInitial ? "#0041d0" : node.isAdmit ? "#ff0072" : "#000000"
        const background = node.isCurrent ? "#ffff55" : "#ffffff";
        const borderWidth = {
            default: 1.5,
            primary: 2,
            highlight: 4
        };

        node.color = {
            background: background,
            border: border,
            highlight: {
                border: border,
                background: background
            }
        };
        node.borderWidth = node.isInitial || node.isAdmit ? borderWidth.primary : borderWidth.default;
        node.borderWidthSelected = borderWidth.highlight;
    })

    graph.edges.forEach(edge => {
        edge.label = transitionsToLabel(edge.transitions)
    })

    return graph;
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
        description: "Конечный автомат, принимающий или отклоняющий заданную строку символов путём прохождения через последовательность состояний, определённых строкой",
        preview: "dfa.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 20, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 200, y: 0, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 0, y: 180, label: "S2", isAdmit: true, isInitial: false, isCurrent: false},
                {id: 4, x: 180, y: 200, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 2, transitions: new Set(["0"])},
                {from: 2, to: 1, transitions: new Set(["0"])},
                {from: 3, to: 4, transitions: new Set(["0"])},
                {from: 4, to: 4, transitions: new Set(["0"])},
                {from: 1, to: 3, transitions: new Set(["1"])},
                {from: 2, to: 4, transitions: new Set(["1"])},
                {from: 3, to: 2, transitions: new Set(["1"])},
                {from: 4, to: 2, transitions: new Set(["1"])},
            ]
        }
    },
    nfa: {
        name: "НКА",
        description: "Автомат отличается от ДКА, тем что может находиться в нескольких состояниях одновременно",
        preview: "nfa.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S0", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 100, label: "S1", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 200, y: 200, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 4, x: 300, y: 300, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set(['0', '1'])},
                {from: 1, to: 2, transitions: new Set(['0'])},
                {from: 2, to: 3, transitions: new Set(['1'])},
                {from: 3, to: 4, transitions: new Set(['1'])},
                {from: 4, to: 4, transitions: new Set(['0', '1'])}
            ]
        }
    },
    "nfa-eps": {
        name: "ε-НКА",
        description: "Расширение НКА, в котором используются ε-переходы – переходы между состояниями без входного символа",
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
                {from: 1, to: 1, transitions: new Set(['0', '1'])},
                {from: 1, to: 2, transitions: new Set([EPS])},
                {from: 1, to: 3, transitions: new Set([EPS])},
                {from: 2, to: 4, transitions: new Set(['0'])},
                {from: 4, to: 5, transitions: new Set(['1'])},
                {from: 5, to: 6, transitions: new Set(['1'])},
                {from: 3, to: 7, transitions: new Set(['1'])},
                {from: 7, to: 8, transitions: new Set(['0'])},
                {from: 8, to: 9, transitions: new Set(['1'])},
                {from: 9, to: 9, transitions: new Set(['0', '1'])},
                {from: 6, to: 6, transitions: new Set(['0', '1'])},
            ]
        }
    }
}

export const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}
