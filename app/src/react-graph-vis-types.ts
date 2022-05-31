import { EdgeCore, GraphCore, NodeCore } from "./Logic/IGraphTypes";

export type ComputerType
    = "dfa"
    | "nfa"
    | "nfa-eps"
    | "pda"
    | "tm"
    | "moore"
    | "mealy"
    | "dpda"
    | "dmealy"
    | "dmoore"

export type ComputerInfo = {
    name: string
    description: string,
    preview: string,
    defaultGraph: graph
}

export interface node extends NodeCore {
    id: number,
    label: string,
    x?: number,
    y?: number,
    color?: object,
    isAdmit: boolean,
    isInitial: boolean,
    isCurrent: boolean,
    borderWidth?: number,
    borderWidthSelected?: number,
}

export interface histNode extends NodeCore {
    id: number,
    idd: number,
    label: string,
    x?: number,
    y?: number,
    color?: object,
    isAdmit: boolean,
    isInitial: boolean,
    isCurrent: boolean,
    borderWidth?: number,
    borderWidthSelected?: number,
}

export interface edge extends EdgeCore {
    id?: string,
    from: number,
    to: number,
    label?: string,
    //transitions: Set<string>//////
}

export interface graph extends GraphCore {
    nodes: node[],
    edges: edge[]
}

export type clickEventArgs = {
    nodes: number[],
    edges: string[],
    event: object,
    pointer: {
        DOM: {
            x: number,
            y: number
        },
        canvas: {
            x: number,
            y: number
        }
    }
}
export type dragEndEventArgs = clickEventArgs;
export type doubleClickEventArgs = clickEventArgs;
export type selectEventArgs = clickEventArgs;
export type selectNodeEventArgs = selectEventArgs;
export type selectEdgeEventArgs = selectEventArgs;

export type deselectNodeEventArgs = {
    nodes: number[],
    edges: string[],
    event: object,
    pointer: {
        DOM: {
            x: number,
            y: number
        },
        canvas: {
            x: number,
            y: number
        }
    },
    previousSelection: {
        nodes: number[],
        edges: string[],
    }
};
export type deselectEdgeEventArgs = deselectNodeEventArgs;

export type controlNodeDraggingEventArgs = {
    nodes: number[],
    edges: string[],
    event: object,
    pointer: {
        DOM: {
            x: number,
            y: number
        },
        canvas: {
            x: number,
            y: number
        }
    },
    controlEdge: {
        from: number,
        to: number | undefined
    }
}