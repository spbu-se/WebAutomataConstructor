import {getCookie} from "../utils";

export const BASE_URL = new URL("https://sscss.ru");
export const AUTH_PORT = "2101";
export const PING_PORT = "2102";
export const SAVES_PORT = "2103";

export function getAuthHeaders(): Headers {
    const headers = new Headers();

    headers.set("tt", "g");
    headers.set("t", getCookie("token") || "");

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