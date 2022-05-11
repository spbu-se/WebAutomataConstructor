import SavesManager from "./SavesManager";
import {Save, SaveMeta} from "./Save";
import {ComputerType, graph} from "../react-graph-vis-types";

const itemName = "saves";

export default class BrowserSavesManager implements SavesManager {
    getSavesMeta(): Promise<SaveMeta[]> {
        let saves = BrowserSavesManager.getSaves();

        return new Promise<SaveMeta[]>(function (resolve) {
                resolve(saves);
            }
        )
    }

    getSave(saveMeta: SaveMeta): Promise<Save | null> {
        let saves = BrowserSavesManager.getSaves();

        let save = saves.find(save => save.id == saveMeta.id);

        return new Promise(function (resolve) {
            resolve(save || null);
        });
    }

    save(name: string, graph: graph, type: ComputerType): Promise<void> {
        if (!localStorage) {
            throw new Error("no local storage");
        }

        const saves = BrowserSavesManager.getSaves();
        const next_id = (Math.max(...saves.map(save => Number(save.id))) + 1).toString();
        const save_index = saves.findIndex(save => save.name == name);
        const save = {id: "0", name: name, save: {graph: graph, type: type}};

        if (save_index == -1) {
            save.id = next_id;
            saves.push(save);
        } else {
            save.id = saves[save_index].id;
            saves[save_index] = save;
        }

        let saves_json = JSON.stringify(saves, (key, value) => value instanceof Set ? Array.from(value) : value);

        localStorage.setItem(itemName, saves_json);

        return new Promise(function (resolve) {
            resolve();
        });
    }

    private static getSaves(): Save[] {
        if (!localStorage) {
            throw new Error("no local storage");
        }

        let saves: Save[] = [];

        try {
            saves = JSON.parse(localStorage.getItem(itemName) || "");
        } catch (error) {
            console.warn("Invalid saves in local storage: " + error);
            return [];
        }

        return saves;
    }
}