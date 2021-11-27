import {AUTH_PORT, BASE_URL} from "./apiBase";

export type ObtainAuthRequest = {
    state: string,
};

export type ObtainAuthResponse = {
    value: string,
};

export default function obtainAuth(request: ObtainAuthRequest): Promise<ObtainAuthResponse> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = AUTH_PORT;
        url.pathname = "/auth/obtain";
        url.pathname += "/" + request.state;

        fetch(url.href)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status + response.statusText);
                }

                return response.json()
            })
            .then(json => resolve(json))
            .catch(error => reject(error));
    });
}