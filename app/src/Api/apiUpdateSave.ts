import {BASE_URL, getAuthHeaders} from "./apiBase";

export type UpdateSaveRequest = {
    isShared: boolean,
};

export default function ApiUpdateSave(id: string, request: UpdateSaveRequest, onAuthFailed: () => void): Promise<void> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + `/save/${id}`;

        const headers = getAuthHeaders();
        headers.set("Content-Type", "application/json");
        const body = JSON.stringify(request);

        fetch(url, {
            method: "PUT",
            headers: headers,
            body: body,
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