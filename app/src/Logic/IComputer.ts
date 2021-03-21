import {statement, Step} from "./Types";

// It will be abstract class
export interface IComputer {
    setInput: (input: string[]) => void
    step: (input: string) => Step
    run: () => Step
    restart: () => void
}

export const eof: statement = {isAdmit: false, idLogic: -1, id: -1}