import {BASE_URL, getParams} from "./apiBase";
import {UserModel} from "../Models/UserModel";
import {getCookie} from "../utils";

export default function ApiGetUser(): Promise<UserModel> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + "/user";

        const jwt = getCookie("jwt");

        if (!jwt) {
            reject();
        }

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwt}`);

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