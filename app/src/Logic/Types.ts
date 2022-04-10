import {EdgeCore, NodeCore, TransitionParams} from "./IGraphTypes";
import {Stack} from "./Stack";
import {TMMemory} from "./TM"
export type elementOfAlphabet = {
    value: string
    idLogic: number
}

export type Output = string

export type Edge = {
    localValue: TransitionParams[]
        // string[]
} & EdgeCore

export type statement = {
    idLogic: number
} & NodeCore

export type History = {
    nodes: NodeCore[]
    by: string
}

export interface HistUnit {
    by: any,
    from: NodeCore //number, //NodeCore
    value: NodeCore // number //NodeCore
    
}
export type Step = {
    nodes: NodeCore[]
    counter: number
    isAdmit: boolean
    history: History[]
    memory?: string[]
    pointer?: number
    output?: Output[]
    tree?: HistUnit[][]
    byEpsPred?: NodeCore[], 
    byEpsAfter?: NodeCore[], 
    byLetter?: NodeCore[]
}


export type position = {
    stmt: statement,
    from?: NodeCore,
    cur?: NodeCore,
    by?: any,
    stack?: Stack<string>
}
