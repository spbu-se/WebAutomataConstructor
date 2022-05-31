import {BASE_URL, getAuthHeaders, postParams} from "./apiBase";

export type RemoveSaveRequest = {
    id: string
};

export default function ApiRemoveSave(request: RemoveSaveRequest, onAuthFailed: () => void): Promise<void> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/save/${request.id}`;

        const headers = getAuthHeaders();

        fetch(url, {
            method: "DELETE",
            headers: headers,
        })
            .then(response => {
                if (response.status == 401) {
                    onAuthFailed();
                }
                if (!response.ok) {
                    reject();
                }

                resolve();
            })
            .catch(error => reject(error));
    });
}