import {ComputerType, graph} from "../react-graph-vis-types";

export type SaveMeta = {
    id: string,
    name: string,
};

export type Save = {
    id: string,
    name: string,
    save: SaveData,
};

export type SaveData = {
    graph: graph,
    type: ComputerType,
}
