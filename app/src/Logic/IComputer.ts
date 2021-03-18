import {NodeCore} from "./IGraphTypes";

export type Step = {
    node: NodeCore
    counter: number
}

export interface IComputer {
    setInput: (input: string[]) => void
    step: (input: string) => Step
    isAdmit: () => Step
    restart: () => void
}