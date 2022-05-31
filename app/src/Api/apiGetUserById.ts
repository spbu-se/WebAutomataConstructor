import {BASE_URL, getAuthHeaders, getParams} from "./apiBase";
import {UserModel} from "../Models/UserModel";
import {getCookie} from "../utils";

export default function ApiGetUserById(id: string): Promise<UserModel> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/user/${id}`;

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