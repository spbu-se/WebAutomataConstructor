import {getCookie} from "../utils";

export const BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL ?? "http://localhost";

export function getAuthHeaders(): Headers {
    const headers = new Headers();

    headers.set("Authorization", `Bearer ${getCookie("jwt")}`);

    return headers;
}

export function getParams(headers: Headers): RequestInit {
    return {
        method: "GET",
        headers: headers,
    };
}

export function postParams(headers: Headers, body: BodyInit): RequestInit {
    headers.set("Content-Type", "application/json");

    return {
        method: "POST",
        headers: headers,
        body: body,
    };
}