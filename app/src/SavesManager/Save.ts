import {ComputerType, graph} from "../react-graph-vis-types";

export type SaveMeta = {
    id: number,
    name: string,
};

export type Save = {
    id: number,
    name: string,
    save: SaveData,
};

export type SaveData = {
    graph: graph,
    type: ComputerType,
}
