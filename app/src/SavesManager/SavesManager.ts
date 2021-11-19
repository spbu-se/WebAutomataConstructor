import Save from "./Save";

export default interface SavesManager {
    getSavesNames(): string[];

    getSave(name: string): Save | null;

    save(save: Save): void;
}