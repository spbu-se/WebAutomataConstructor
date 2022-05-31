import React from "react";

import {useNavigate} from "react-router-dom";

import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import "./AppHeader.css";

export interface AppHeaderProps {
    onMenuButtonClicked: (event: React.MouseEvent) => void,
    onSaveButtonClicked: (event: React.MouseEvent) => void,
    onLogoutButtonClicked: () => void,
    isLogin: boolean,
}

export const AppHeader: React.FunctionComponent<AppHeaderProps> = (
    {
        onMenuButtonClicked,
        onSaveButtonClicked,
        onLogoutButtonClicked,
        isLogin,
    }) => {
    const navigate = useNavigate();

    const onSignInButtonClicked = () => {
        navigate("/login");
    }

    const onSignOutButtonClicked = () => {
        document.cookie = "jwt=; path=/; secure; max-age=-99999999";
        onLogoutButtonClicked();
    }

    const onProfileButtonClicked = () => {
        navigate("/me");
    }


    return (
        <AppBar position="sticky">
            <Toolbar variant="dense">
                <div className="app__header__left">
                    <Button className="app__header__button"
                            color="inherit"
                            onClick={onMenuButtonClicked}
                    >
                        Меню
                    </Button>

                    <Button className="app__header__button"
                            color="inherit"
                            onClick={onSaveButtonClicked}
                    >
                        Сохранить
                    </Button>
                </div>

                <div className="app__header__right">
                    {
                        isLogin &&
                        <Button className="app__header__button"
                                color="inherit"
                                onClick={onProfileButtonClicked}
                        >
                            Профиль
                        </Button>
                    }

                    <Button className="app__header__button"
                            color="inherit"
                            onClick={isLogin ? onSignOutButtonClicked : onSignInButtonClicked}
                    >
                        {isLogin ? "Выйти" : "Войти"}
                    </Button>
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;
