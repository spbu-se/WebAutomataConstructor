import {BASE_URL} from "./apiBase";

export type ApiSignInRequest = {
    email: string,
    password: string,
};

export default function ApiSignIn(request: ApiSignInRequest): Promise<string> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + "/auth/signin";

        const body = JSON.stringify(request);

        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
            redirect: "manual",
        })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    reject();
                }
            })
            .then(text => {
                if (!text) {
                    reject();
                } else {
                    resolve(text);
                }
            })
            .catch(error => reject(error));
    });
}