import {ComputerType, graph} from "../react-graph-vis-types";

export type SaveMeta = {
    id: number,
    name: string,
    user_id: string,
};

export type Save = {
    id: number,
    name: string,
    save: SaveData,
    user_id: string,
};

export type SaveData = {
    graph: graph,
    type: ComputerType,
}
