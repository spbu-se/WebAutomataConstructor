import {EdgeCore, NodeCore, TransitionParams} from "./IGraphTypes";
import {Stack} from "./Stack";
import {TMMemory} from "./TM"
export type elementOfAlphabet = {
    value: string
    idLogic: number
}

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

export type Step = {
    nodes: NodeCore[]
    counter: number
    isAdmit: boolean
    history: History[]
    memory?: string[]
}


export type position = {
    stmt: statement,
    stack?: Stack<string>
}
