import SavesManager from "./SavesManager";
import Save from "./Save";

const itemName = "saves";

export default class BrowserSavesManager implements SavesManager {
    getSavesNames(): string[] {
        let saves = BrowserSavesManager.getSaves();

        return saves.map(save => {
            return save.getName()
        });
    }

    getSave(name: string): Save | null {
        let saves = BrowserSavesManager.getSaves();

        let save = saves.find(save => save.getName() == name);

        return save || null;
    }

    save(save: Save): void {
        if (!localStorage) {
            throw new Error("no local storage");
        }

        let saves = BrowserSavesManager.getSaves();
        let save_index = saves.findIndex(s => s.getName() == save.getName());

        if (save_index == -1) {
            saves.push(save);
        } else {
            saves[save_index] = save;
        }

        let saves_json = JSON.stringify(saves, (key, value) => value instanceof Set ? Array.from(value) : value);

        localStorage.setItem(itemName, saves_json);
    }

    private static getSaves(): Save[] {
        if (!localStorage) {
            throw new Error("no local storage");
        }

        let saves: Save[] = [];

        try {
            const save_objects = JSON.parse(localStorage.getItem(itemName) || "");
            saves = save_objects.map((save_object: object) => Save.fromObject(save_object));
        } catch (error) {
            console.warn("Invalid saves in local storage: " + error);
            return [];
        }

        return saves;
    }
}