import {BASE_URL, getAuthHeaders, getParams} from "./apiBase";
import {SaveModel} from "../Models/SaveModel";

export default function ApiGetSaves(onAuthFailed: () => void): Promise<SaveModel[]> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + "/save";

        const headers = getAuthHeaders();
        const params = getParams(headers);

        fetch(url, params)
            .then(response => {
                if (response.status == 401) {
                    onAuthFailed();
                }
                if (!response.ok) {
                    throw new Error(response.status + response.statusText);
                }

                return response.json()
            })
            .then(json => resolve(json))
            .catch(error => reject(error));
    });
}