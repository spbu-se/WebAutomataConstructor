import React, {FC} from "react";
import "./LoginPage.css";
import GoogleOAuthButton from "./GoogleOAuthButton/GoogleOAuthButton";

interface LoginPageProps {
}

const LoginPage: FC<LoginPageProps> = ({}) => {
    return (
        <div className="login-page">
            <div className="login-page__form">
                <GoogleOAuthButton/>
            </div>
        </div>
    )
};

export default LoginPage;