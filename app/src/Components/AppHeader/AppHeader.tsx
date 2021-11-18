import React from "react";

import {useHistory} from "react-router-dom";

import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import "./AppHeader.css";

export interface AppHeaderProps {
    onMenuButtonClicked: (event: React.MouseEvent) => void,
    onSaveButtonClicked: (event: React.MouseEvent) => void,
}

export const AppHeader: React.FunctionComponent<AppHeaderProps> = (
    {
        onMenuButtonClicked,
        onSaveButtonClicked
    }) => {
    const history = useHistory();

    const onSignInButtonClicked = () => {
        history.push("/login");
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
                        onClick={onSignInButtonClicked}
                    >
                        Войти
                    </Button>
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;
