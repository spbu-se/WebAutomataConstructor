import {Save, SaveMeta} from "./Save";
import {ComputerType, graph} from "../react-graph-vis-types";

export default interface SavesManager {
    getSavesMeta(): Promise<SaveMeta[]>;

    getSave(saveMeta: SaveMeta): Promise<Save | null>;

    save(name: string, graph: graph, type: ComputerType): Promise<void>;
}
