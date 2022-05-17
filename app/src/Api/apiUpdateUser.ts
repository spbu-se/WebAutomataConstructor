import { UserModel } from "../Models/UserModel";
import { BASE_URL, getAuthHeaders } from "./apiBase";

export type UpdateUserRequest = {
    about: string,
};

export default function ApiUpdateUser(request: UpdateUserRequest): Promise<UserModel> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/user`;

        const headers = getAuthHeaders();
        headers.set("Content-Type", "application/json");
        const body = JSON.stringify(request);

        fetch(url, {
            method: "PUT",
            headers: headers,
            body: body,
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