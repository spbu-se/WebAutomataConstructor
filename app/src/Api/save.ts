import {BASE_URL, getAuthHeaders, getParams, postParams, SAVES_PORT} from "./apiBase";

export type SaveRequest = {
    name: string,
    save: string,
};

export default function save(request: SaveRequest, onAuthFailed: () => void): Promise<void> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = SAVES_PORT;
        url.pathname = "/saves";

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