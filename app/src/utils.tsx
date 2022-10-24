import {ComputerInfo, ComputerType, edge, graph, node} from "./react-graph-vis-types";
import {EPS} from "./Logic/Computer";
import {Move, TransitionParams} from "./Logic/IGraphTypes";
import { Elements } from "./App";
import { DataSet } from "vis-network/standalone/esm/vis-network";
import { Output } from "./Logic/Types";


const epsSubstStr = (epsText: string) => (value: string) => value === EPS ? epsText : value

const epsSubstStrs = (epsText: string) => (values: string[]) => {
    return values.map(v =>  epsSubstStr(epsText)(v)).join(":")
}

const mvStr = (value: Move) => value === 0 ? "L" : "R"

export const transitionsToLabel = (transitions: Set<TransitionParams[]>, frmt: null | ComputerType ): string => {
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

    const epsSubst = epsSubstStr("ε")
    const epsSubsts = epsSubstStrs("ε")

    spc = frmt === 'tm' ? '       ' : spc

    let str = "" + spc
    if (transitions !== undefined) {
        if (frmt === 'tm') {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.stackDown !== undefined && v.stackPush !== undefined && v.move !== undefined) {
                        str += epsSubst(v.stackDown) + " | " + epsSubsts(v.stackPush) + " " + mvStr(v.move) + "\n" + spc
                    }
                })
            })
        } else if (frmt === 'pda' || frmt === "dpda") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0 && v.stackDown !== undefined && v.stackDown.length > 0 && v.stackPush !== undefined && v.stackPush.length > 0) {
                        str += epsSubst(v.title) + ", " + epsSubst(v.stackDown) + " | " + epsSubsts(v.stackPush) + " " + "\n" + spc
                    }
                })
            })
        } else if (frmt === "dfa" || frmt === "nfa" || frmt === "nfa-eps" || frmt === "moore" || frmt === "dmoore") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0) {
                        str += epsSubst(v.title) + " " + "\n" + spc
                    }
                })
            })
        } else if (frmt === "mealy" || frmt === "dmealy") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0 && v.output !== undefined) {
                        str += epsSubst(v.title) + " | " + v.output + "\n" + spc
                    }
                })
            })
        }
    }
    return str
}


export const getTransitionsTitles = (transitions: Set<TransitionParams[]>, frmt: null | ComputerType): string => {
    const epsSubst = epsSubstStr("eps")
    const epsSubsts = epsSubstStrs("eps")

    let str = ""
    if (transitions !== undefined) {
        if (frmt === 'tm') {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.stackDown !== undefined && v.stackPush !== undefined && v.move !== undefined) {
                        str += epsSubst(v.stackDown) + " | " + epsSubsts(v.stackPush) + '>' + mvStr(v.move) + ";\n"
                    }
                })
            })
        } else if (frmt === "pda" || frmt === "dpda") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0 && v.stackDown !== undefined && v.stackDown.length > 0 && v.stackPush !== undefined && v.stackPush.length > 0) {
                        str += epsSubst(v.title) + ", " + epsSubst(v.stackDown) + " | " + epsSubsts(v.stackPush) + ";\n"
                    }
                })
            })
        } else if (frmt === "dfa" || frmt === "nfa" || frmt === "nfa-eps" || frmt === "moore" || frmt === "dmoore") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0) {
                        str += epsSubst(v.title) + ";\n"
                    }
                })
            })
        } else if (frmt === "mealy" || frmt === "dmealy") {
            transitions.forEach(value => {
                value.forEach((v) => {
                    if (v.title !== undefined && v.title.length > 0 && v.output !== undefined) {
                        str += epsSubst(v.title) + " | " + v.output + ";\n"
                    }
                })
            })
        } 
    }

    return str
}

export const decorateGraph = (elements: Elements, frmt: null | ComputerType) => {
    elements.edges.forEach((edge) => {
        elements.edges.update({
            id: edge.id!,
            label: transitionsToLabel(edge.transitions, frmt)
        })
    })

    elements.nodes.forEach((node) => {
        const lableTokens =
            node.label
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split('|')
        const output = lableTokens[1] !== undefined ? lableTokens[1] : undefined 
        node.output = output 

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

export const graphToElements = (graph: graph): Elements => {
    let acc: Elements = {nodes: new DataSet<node, "id">(), edges: new DataSet<edge, "id">()}

    graph.nodes.forEach((node) => {
        acc.nodes.add(node)
    })
    graph.edges.forEach((edge) => {
        acc.edges.add(edge)
    })

    return acc
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
                { id: 1, x: 0, y: 0, label: 'S1', isAdmit: false, isInitial: true, isCurrent: false },
                { id: 2, x: 100, y: 0, label: 'S2',  isAdmit: false, isInitial: false, isCurrent: false },
                { id: 3, x: 0, y: 100, label: 'S3',  isAdmit: false, isInitial: false, isCurrent: false },
                { id: 4, x: 100, y: 100, label: 'S4',  isAdmit: false, isInitial: false, isCurrent: false },
                { id: 5, x: 200, y: 0, label: 'S5',  isAdmit: true, isInitial: false, isCurrent: false },
                { id: 6, x: 0, y: 200, label: 'S6',  isAdmit: true, isInitial: false, isCurrent: false },
                { id: 7, x: 200, y: 200, label: 'S7',  isAdmit: false, isInitial: false, isCurrent: false },
            ],
            edges: [
                { from: 1, to: 2, transitions: new Set([[{ title: 'a' }]]) },
                { from: 1, to: 3, transitions: new Set([[{ title: 'b' }]]) },

                { from: 2, to: 4, transitions: new Set([[{ title: 'a' }]]) },
                { from: 2, to: 5, transitions: new Set([[{ title: 'b' }]]) },

                { from: 3, to: 4, transitions: new Set([[{ title: 'a' }]]) },
                { from: 3, to: 6, transitions: new Set([[{ title: 'b' }]]) },

                { from: 4, to: 4, transitions: new Set([[{ title: 'a' }, { title: 'b' }]]) },

                { from: 5, to: 5, transitions: new Set([[{ title: 'a' }]]) },
                { from: 5, to: 7, transitions: new Set([[{ title: 'b' }]]) },

                { from: 6, to: 6, transitions: new Set([[{ title: 'a' }]]) },
                { from: 6, to: 7, transitions: new Set([[{ title: 'b' }]]) },

                { from: 7, to: 7, transitions: new Set([[{ title: 'a' }, { title: 'b' }]]) },
            
            ]
        }
    },
    nfa: {
        name: "НКА",
        description: "Может находиться в нескольких состояниях одновременно",
        preview: "nfa.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S1", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 100, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 200, y: 200, label: "S3", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 4, x: 300, y: 300, label: "S4", isAdmit: true, isInitial: false, isCurrent: false},
            ],
            edges: [
                {from: 1, to: 1, transitions: new Set([[{title: '0'}, {title: '1'}]])},

                {from: 1, to: 2, transitions: new Set([[{title: '0'}]])},
                {from: 2, to: 3, transitions: new Set([[{title: '1'}]])},
                {from: 3, to: 4, transitions: new Set([[{title: '1'}]])},

                {from: 4, to: 4, transitions: new Set([[{title: '0'}]])},
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

                {from: 1, to: 2, transitions: new Set([[{title: EPS}]])},
                {from: 1, to: 3, transitions: new Set([[{title: EPS}]])},
                {from: 2, to: 4, transitions: new Set([[{title: '0'}]])},
                {from: 4, to: 5, transitions: new Set([[{title: '1'}]])},
                {from: 5, to: 6, transitions: new Set([[{title: '1'}]])},
                {from: 3, to: 7, transitions: new Set([[{title: '0'}]])},
                {from: 7, to: 8, transitions: new Set([[{title: '0'}]])},
                {from: 8, to: 9, transitions: new Set([[{title: '1'}]])},

                {from: 9, to: 9, transitions: new Set([[{title: '0'}, {title: '1'}]])},

                {from: 6, to: 6, transitions: new Set([[{title: '0'}, {title: '1'}]])},

            ]
        }
    },
    pda: {
        name: "Автомат с магазинной памятью",
        description: "Использует стек для хранения состояний",
        preview: "pda.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S1", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 100, y: 0, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 200, y: 0, label: "S3", isAdmit: false, isInitial: false, isCurrent: false},
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

                {
                    from: 1, to: 2, transitions: new Set([
                        [
                            {title: EPS, stackDown: 'Z0', stackPush: ['Z0']},
                            {title: EPS, stackDown: '0', stackPush: ['0']},
                            {title: EPS, stackDown: '1', stackPush: ['1']}
                        ]])
                },
                {
                    from: 2, to: 2, transitions: new Set([
                        [
                            {title: '0', stackDown: '0', stackPush: [EPS]},
                            {title: '1', stackDown: '1', stackPush: [EPS]}
                        ]])
                },

                {from: 2, to: 3, transitions: new Set([[{title: EPS, stackDown: 'Z0', stackPush: [EPS]}]])},
            ]
        }
    },
    dpda: {
        name: "Детерминированный автомат с магазинной памятью",
        description: "",
        preview: "pda.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S1", isAdmit: false, isInitial: true, isCurrent: false},
            ],
            edges: [
                {
                    from: 1, to: 1, transitions: new Set([[{title: '0', stackDown: 'Z0', stackPush: ['0', 'Z0']},]])
                },
            ]
        }
    },
    tm: {
        name: "Машина Тьюринга",
        description: "Машина Тьюринга с одной лентой",
        preview: "tm.png",
        defaultGraph: {
            nodes: [
                {id: 1, x: 0, y: 0, label: "S1", isAdmit: false, isInitial: true, isCurrent: false},
                {id: 2, x: 200, y: 0, label: "S2", isAdmit: false, isInitial: false, isCurrent: false},
                {id: 3, x: 0, y: 200, label: "S3", isAdmit: true, isInitial: false, isCurrent: false},
                {id: 4, x: 200, y: 200, label: "S4", isAdmit: true, isInitial: false, isCurrent: false},
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
    mealy: {
        name: "Автомат Мили",
        preview: "mealy.png",
        description: "Автомат, с выходными символами на ребрах",
        defaultGraph: {
            nodes: [
                { x: 0, y: 0, id: 1, isAdmit: false, isCurrent: false, isInitial: true, label: "0 rub" },
                { x: 300, y: -200, id: 2, isAdmit: false, isCurrent: false, isInitial: false, label: "5 rub" },
                { x: 500, y: -300, id: 3, isAdmit: false, isCurrent: false, isInitial: false, label: "15 rub" },
                { x: -100, y: -500, id: 4, isAdmit: false, isCurrent: false, isInitial: false, label: "10 rub" }
            ],
            edges: [
                { from: 1, to: 2, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 1, to: 4, transitions: new Set([[{ title: 't', output: 'n' }]]) },
                { from: 2, to: 3, transitions: new Set([[{ title: 't', output: 'n' }]]) },
                { from: 2, to: 4, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 3, to: 1, transitions: new Set([[{ title: 'f', output: '0' }, { title: 't', output: '5' }]]) },
                { from: 4, to: 3, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 4, to: 1, transitions: new Set([[{ title: 't', output: '0' }]]) },
            ]
        }
    },
    dmealy: {
        name: "Детерминированный автомат Мили",
        preview: "mealy.png",
        description: "",
        defaultGraph: {
            nodes: [
                { x: 0, y: 0, id: 1, isAdmit: false, isCurrent: false, isInitial: true, label: "0 rub" },
                { x: 300, y: -200, id: 2, isAdmit: false, isCurrent: false, isInitial: false, label: "5 rub" },
                { x: 500, y: -300, id: 3, isAdmit: false, isCurrent: false, isInitial: false, label: "15 rub" },
                { x: -100, y: -500, id: 4, isAdmit: false, isCurrent: false, isInitial: false, label: "10 rub" }
            ],
            edges: [
                { from: 1, to: 2, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 1, to: 4, transitions: new Set([[{ title: 't', output: 'n' }]]) },
                { from: 2, to: 3, transitions: new Set([[{ title: 't', output: 'n' }]]) },
                { from: 2, to: 4, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 3, to: 1, transitions: new Set([[{ title: 'f', output: '0' }, { title: 't', output: '5' }]]) },
                { from: 4, to: 3, transitions: new Set([[{ title: 'f', output: 'n' }]]) },
                { from: 4, to: 1, transitions: new Set([[{ title: 't', output: '0' }]]) },
            ]
   }
    },
    moore: {
        name: "Автомат Мура",
        description: "Автомат, с выходными символами в состояниях",
        preview: "moore.png",
        defaultGraph: {
            nodes: [
                { x: 0, y: 0, id: 1, isAdmit: false, isCurrent: false, isInitial: true, label: "S1 | b" },
                { x: 300, y: 0, id: 2, isAdmit: false, isCurrent: false, isInitial: false, label: "S2 | b"  },
                { x: 100, y: 100, id: 3, isAdmit: false, isCurrent: false, isInitial: false, label: "S3 | a"  },
            ],
            edges: [
                { from: 1, to: 1, transitions: new Set([[{ title: '1' }]]) },
                { from: 1, to: 2, transitions: new Set([[{ title: '0' }]]) },
    
                { from: 2, to: 2, transitions: new Set([[{ title: '0' }]]) },
                { from: 2, to: 3, transitions: new Set([[{ title: '1' }]]) },
    
                { from: 3, to: 2, transitions: new Set([[{ title: '0' }]]) },
                { from: 3, to: 1, transitions: new Set([[{ title: '1' }]]) },
            ]        
        }
    },
    dmoore: {
        name: "Детерминированный автомат Мура",
        description: "",
        preview: "moore.png",
        defaultGraph: {
            nodes: [
                { x: 0, y: 0, id: 0, isAdmit: false, isCurrent: false, isInitial: true, label: "S1 | b" },
                { x: 300, y: 0, id: 1, isAdmit: false, isCurrent: false, isInitial: false, label: "S2 | b"  },
                { x: 100, y: 100, id: 2, isAdmit: false, isCurrent: false, isInitial: false, label: "S3 | a"  },
            ],
            edges: [
                { from: 0, to: 0, transitions: new Set([[{ title: '1' }]]) },
                { from: 0, to: 1, transitions: new Set([[{ title: '0' }]]) },
    
                { from: 1, to: 1, transitions: new Set([[{ title: '0' }]]) },
                { from: 1, to: 2, transitions: new Set([[{ title: '1' }]]) },
    
                { from: 2, to: 1, transitions: new Set([[{ title: '0' }]]) },
                { from: 2, to: 0, transitions: new Set([[{ title: '1' }]]) },
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