import {ComputerType, graph} from "../react-graph-vis-types";

export default class Save {
    private readonly name: string;
    private readonly graph: graph;
    private readonly type: ComputerType;

    constructor(name: string, graph: graph, type: ComputerType) {
        this.name = name;
        this.graph = graph;
        this.type = type;
    }

    static fromObject(object: object): Save {
        const save = new Save("", {nodes: [], edges: []}, "dfa");
        return Object.assign(save, object);
    }

    getName(): string {
        return this.name;
    }

    getGraph(): graph {
        return this.graph;
    }

    getType(): ComputerType {
        return this.type;
    }
}