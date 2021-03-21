import {edgeCore, graphCore, nodeCore} from "./Logic/IGraphTypes";

export interface node extends nodeCore{
   // id: number,
    label?: string,
    x?: number,
    y?: number,
    color?: object,
   // isAdmit: boolean,
    isInitial: boolean,
    isCurrent: boolean
}

export interface edge extends edgeCore {
    id?: string,
    //from: number,
   // to: number,
    label?: string,
    //transitions: Set<string>//////
}

export interface graph extends graphCore {
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