import { Output } from "./Types";

export interface NodeCore {
    id: number,
    isAdmit: boolean,
    stack?: string[],
    move?: Move,
    output?: Output,
    from?: NodeCore,
    cur?: NodeCore,
    by?: any,
    oldStack?: string[],
    stackDown?: string,
    countTokens?: number,
    isChangedTokens?: boolean
}

export type CountArcs = {
    InputArcs: number, 
    OutputArcs: number,
}

export enum Move {
    L,
    R,
}

export interface TransitionParams {
    title: string
    stackDown?: string
    stackPush?: string[]
    move?: Move
    output?: Output
    countArcs?: CountArcs
}


export interface EdgeCore  {
    from: number
    to: number
    transitions: Set<TransitionParams[]>
}

export interface GraphCore  {
    nodes: NodeCore[]
    edges: EdgeCore[]
}

export interface GraphEval {
    graphcore: GraphCore,
    start: NodeCore
}

export interface GraphEvalMultiStart {
    graphcore: GraphCore,
    start: NodeCore[]
}