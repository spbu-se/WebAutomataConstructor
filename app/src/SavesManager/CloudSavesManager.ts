import SavesManager from "./SavesManager";
import {Save, SaveMeta} from "./Save";
import {ComputerType, graph} from "../react-graph-vis-types";

import getSaves, {GetSavesResponse} from "../Api/getSaves";
import {default as apiSave, SaveRequest} from "../Api/save";
import getSave, {GetSaveRequest} from "../Api/getSave";

export default class CloudSavesManager implements SavesManager {
    async getSave(saveMeta: SaveMeta): Promise<Save | null> {
        const request: GetSaveRequest = {
            id: saveMeta.id
        };

        let save = null;

        try {
            save = await getSave(request)
        } catch (error) {
            console.error(error);
        }

        return save;
    }

    async getSavesMeta(): Promise<SaveMeta[]> {
        let saves: GetSavesResponse = [];

        try {
            saves = await getSaves();
        } catch (error) {
            console.error(error);
        }

        return saves;
    }

    async save(name: string, graph: graph, type: ComputerType): Promise<void> {
        const serialized_save = JSON.stringify({
            graph: graph,
            type: type
        }, (key, value) => value instanceof Set ? Array.from(value) : value);

        const request: SaveRequest = {
            name: name,
            save: serialized_save
        };

        try {
            await apiSave(request);
        } catch (error) {
            console.error(error);
        }
    }
}
