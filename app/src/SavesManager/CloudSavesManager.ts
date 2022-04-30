import SavesManager from "./SavesManager";
import {Save, SaveMeta} from "./Save";
import {ComputerType, graph} from "../react-graph-vis-types";

import ApiGetSaves, {GetSavesResponse} from "../Api/apiGetSaves";
import ApiGetSave, {GetSaveRequest} from "../Api/apiGetSave";
import ApiSave, {SaveRequest} from "../Api/apiSave";

export default class CloudSavesManager implements SavesManager {
    private readonly onAuthFailed;

    constructor(onAuthFailed: () => void) {
        this.onAuthFailed = onAuthFailed;
    }

    async getSave(saveMeta: SaveMeta): Promise<Save | null> {
        const request: GetSaveRequest = {
            id: saveMeta.id
        };

        let save = null;

        try {
            const response = await ApiGetSave(request, this.onAuthFailed);

            save = {
                id: response.id,
                name: response.name,
                save: JSON.parse(response.data),
            };
        } catch (error) {
            console.error(error);
        }

        return save;
    }

    async getSavesMeta(): Promise<SaveMeta[]> {
        let saves: GetSavesResponse = [];

        try {
            saves = await ApiGetSaves(this.onAuthFailed);
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
            data: serialized_save
        };

        try {
            await ApiSave(request, this.onAuthFailed);
        } catch (error) {
            console.error(error);
        }
    }
}
