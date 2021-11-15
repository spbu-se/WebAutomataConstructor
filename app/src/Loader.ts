import {ComputerType, graph} from "./react-graph-vis-types";

export default class Loader {
    public static GetSavings = (): Saving[] => {
        const entries = Object.entries(localStorage);
        const savings = [];

        for (const [key, value] of entries) {
            let saving: Saving;

            try {
                saving = JSON.parse(value, (key, value) => key === "lastSave" ? new Date(value) : value);
            } catch (e) {
                console.warn(`Bad saving \"${key}\": ${value}`);
                continue;
            }

            savings.push(saving);
        }

        savings.sort((a, b) => b.lastSave.getTime() - a.lastSave.getTime());

        return savings;
    }

    public static Save = (name: string, graph: graph, type: ComputerType) => {
        const saving = {
            name: name,
            type: type,
            lastSave: new Date(),
            graph: graph
        };

        const json = JSON.stringify(saving,
            (key, value) => value instanceof Set ? Array.from(value) : value);

        localStorage.setItem(saving.name, json);
    }
}

export type Saving = {
    name: string,
    type: ComputerType
    lastSave: Date,
    graph: graph
}