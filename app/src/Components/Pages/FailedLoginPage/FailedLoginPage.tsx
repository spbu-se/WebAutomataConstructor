import React, {FC} from "react";
import "./FailedLoginPage.css";

import { Link } from "react-router-dom";

interface FailedLoginPageProps {
}

const FailedLoginPage: FC<FailedLoginPageProps> = ({}) => {
    return (
        <div className="failed-login-page">
            <h1>Login failed</h1>
            <Link to="/login">Login page</Link>
        </div>
    )
};

export default FailedLoginPage;