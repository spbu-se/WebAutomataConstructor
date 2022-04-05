import {BASE_URL, getAuthHeaders, getParams, USERS_PORT} from "./apiBase";


export type GetUserResponse = {
    uid: string,
    username: string,
    name: string | null
};

export default function apiGetUser(onAuthFailed: () => void): Promise<GetUserResponse> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = USERS_PORT;
        url.pathname = "/users";

        const headers = getAuthHeaders();
        const params = getParams(headers);

        fetch(url.href, params)
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