import {BASE_URL, getAuthHeaders, getParams, postParams, SAVES_PORT, USERS_PORT} from "./apiBase";

export type ApiUpdateUserRequest = {
    name: string,
};

export default function apiUpdateUser(request: ApiUpdateUserRequest, onAuthFailed: () => void): Promise<void> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = USERS_PORT;
        url.pathname = "/users/update";

        const body = JSON.stringify(request);
        const headers = getAuthHeaders();
        const params = postParams(headers, body);

        fetch(url.href, params)
            .then(response => {
                if (response.status == 401) {
                    onAuthFailed();
                }
                if (!response.ok) {
                    throw new Error(response.status + response.statusText);
                }

                resolve();
            })
            .catch(error => reject(error));
    });
}