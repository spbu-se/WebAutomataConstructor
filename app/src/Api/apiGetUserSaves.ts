import {BASE_URL, getAuthHeaders, getParams} from "./apiBase";
import { SaveModel } from "../Models/SaveModel";

export default function ApiGetUserSaves(id: string): Promise<SaveModel[]> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/save/user/${id}`;

        const headers = getAuthHeaders();
        const params = getParams(headers);

        fetch(url, params)
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