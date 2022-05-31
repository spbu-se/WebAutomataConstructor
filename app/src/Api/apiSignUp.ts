import {BASE_URL} from "./apiBase";

export type ApiSignUpRequest = {
    email: string,
    password: string,
    about: string,
};

export default function ApiSignUp(request: ApiSignUpRequest): Promise<void> {
    return new Promise(function (resolve, reject) {
        const url = BASE_URL + "/auth/signup";

        const body = JSON.stringify(request);

        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        })
            .then(response => {
                if (response.ok) {
                    resolve();
                } else {
                    reject();
                }
            })
            .catch(error => reject(error));
    });
}