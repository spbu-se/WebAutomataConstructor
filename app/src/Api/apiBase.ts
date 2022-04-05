import {getCookie} from "../utils";

export const BASE_URL = new URL(process.env.REACT_APP_BACKEND_BASE_URL ?? "http://localhost");
export const AUTH_PORT = process.env.REACT_APP_BACKEND_AUTH_PORT ?? "8001";
export const PING_PORT = process.env.REACT_APP_BACKEND_PING_PORT ?? "8002";
export const SAVES_PORT = process.env.REACT_APP_BACKEND_SAVES_PORT ?? "8003";
export const USERS_PORT = process.env.REACT_APP_BACKEND_SAVES_PORT ?? "8003";

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