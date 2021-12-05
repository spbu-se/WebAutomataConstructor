import {BASE_URL, getAuthHeaders, getParams, SAVES_PORT} from "./apiBase";
import {ComputerType, graph} from "../react-graph-vis-types";

export type GetSaveRequest = {
    id: number,
};

export type GetSaveResponse = {
    id: number,
    name: string,
    save: string,
    user_id: string,
};

export default function getSave(request: GetSaveRequest, onAuthFailed: () => void): Promise<GetSaveResponse> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL;
        url.port = SAVES_PORT;
        url.pathname = "/saves";
        url.pathname += "/" + request.id;

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