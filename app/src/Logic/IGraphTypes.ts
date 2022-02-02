export interface NodeCore  {
    id: number
    isAdmit: boolean
    stack?: string[]
    move?: Move
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
}


export interface EdgeCore  {
    from: number
    to: number
    transitions: Set<TransitionParams[]>

    // transitions: Set<string>
    // stackDown?: string
    // stackPush?: string[]
}

export interface GraphCore  {
    nodes: NodeCore[]
    edges: EdgeCore[]
}

export interface GraphEval {
    graphcore: GraphCore,
    start: NodeCore
}