import React, {FC} from "react";
import "./FailedLoginPage.css";

interface FailedLoginPageProps {
}

const FailedLoginPage: FC<FailedLoginPageProps> = ({}) => {
    return (
        <div className="failed-login-page">
            <h1>Login failed</h1>
            <a href={"/login"}>Login page</a>
        </div>
    )
};

export default FailedLoginPage;