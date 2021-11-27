import React, {useEffect} from "react";

import {useHistory} from "react-router-dom";

import {getCookie} from "../../../utils";

import obtainAuth from "../../../Api/obtainAuth";

import "./SuccessLoginPage.css";

export const SuccessLoginPage: React.FunctionComponent = ({}) => {
    const updateAuth = async () => {
        const state = getCookie("state") || "";

        let response = null;

        try {
            response = await obtainAuth({state: state});
        } catch (error) {
            console.error(error);
            return;
        }

        document.cookie = `token=${response.value}; path=/; secure; max-age=86400`;
        history.push("/");
    }

    useEffect(() => {
        updateAuth();
    }, []);

    const history = useHistory();

    return (
        <div>
        </div>
    )
};

export default SuccessLoginPage;