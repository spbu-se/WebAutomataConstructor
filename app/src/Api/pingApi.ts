import {BASE_URL, PING_PORT, getAuthHeaders, getParams} from "./apiBase";

export type PingResponse = {
    pong: string,
};

export default function pingApi(): Promise<PingResponse> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = PING_PORT;
        url.pathname = "/ping";

        const headers = getAuthHeaders();
        const params = getParams(headers);

        fetch(url.href, params)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status + response.statusText);
                }

                return response.text();
            })
            .then(text => resolve({pong: text}))
            .catch(error => reject(error));
    });
}