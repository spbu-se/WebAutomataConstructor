import { Computer } from "../Computer"
import { Step } from "../Types"

export const testFunc = (nfa: Computer): Step => {
    for (let i = 0; i < nfa.getInput().length - 1; i++) {
        nfa.step()
    }
    return nfa.step()
}