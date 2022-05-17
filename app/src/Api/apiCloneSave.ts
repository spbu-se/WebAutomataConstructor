import { SaveModel } from "../Models/SaveModel";
import { BASE_URL, getAuthHeaders } from "./apiBase";


export default function ApiCloneSave(id: string): Promise<SaveModel> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/save/clone/${id}`;

        const headers = getAuthHeaders();

        fetch(url, {
            method: "POST",
            headers: headers,
        })
            .then(response => {
                if (!response.ok) {
                    reject();
                }

                return response.json()
            })
            .then(json => resolve(json))
            .catch(error => reject(error));
    });
}