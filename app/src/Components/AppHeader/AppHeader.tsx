import React from "react";

import {useHistory} from "react-router-dom";

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
    const history = useHistory();

    const onSignInButtonClicked = () => {
        history.push("/login");
    }

    const onSignOutButtonClicked = () => {
        document.cookie = "token=; path=/; secure; max-age=-99999999";
        onLogoutButtonClicked();
    }


    return (
        <AppBar position="sticky">
            <Toolbar variant="dense">
                <div className="app__header__left">
                    <Button
                        className="app__header__button"
                        color="inherit"
                        onClick={onMenuButtonClicked}
                    >
                        Меню
                    </Button>

                    <Button
                        className="app__header__button"
                        color="inherit"
                        onClick={onSaveButtonClicked}
                    >
                        Сохранить
                    </Button>
                </div>

                <div className="app__header__right">
                    <Button
                        className="app__header__button"
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
