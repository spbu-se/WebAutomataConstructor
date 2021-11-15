import {EdgeCore, NodeCore} from "./IGraphTypes";

export type elementOfAlphabet = {
    value: string
    idLogic: number
}

export type Edge = {
    localValue: string[]
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
}

export type statementNfa = {
    value: statement[]
    id: number
    isAdmit: boolean
}