import {BASE_URL, getAuthHeaders, getParams} from "./apiBase";

export type GetSaveRequest = {
    id: string,
};

export type GetSaveResponse = {
    id: string,
    name: string,
    data: string,
};

export default function ApiGetSave(request: GetSaveRequest, onAuthFailed: () => void): Promise<GetSaveResponse> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/save/${request.id}`;

        const headers = getAuthHeaders();
        const params = getParams(headers);

        fetch(url, params)
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