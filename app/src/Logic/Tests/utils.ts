import { Computer } from "../Computer"
import { Step } from "../Types"

export const testFunc = (computer: Computer): Step => {
    for (let i = 0; i < computer.getInput().length - 1; i++) {
        computer.step()
    }
    return computer.step()
}