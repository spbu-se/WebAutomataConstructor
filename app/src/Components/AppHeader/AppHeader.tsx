import React from "react";

import Button from "@material-ui/core/Button";

import MenuIcon from "@material-ui/icons/Menu";

import "./AppHeader.css";

export interface AppHeaderProps {
    onMenuButtonClicked: (event: React.MouseEvent<HTMLButtonElement>) => void,
    onSaveButtonClicked: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

export const AppHeader: React.FunctionComponent<AppHeaderProps> = (
    {
        onMenuButtonClicked,
        onSaveButtonClicked
    }) => {
    return (
        <div className="app__header">
            <div className="app__header__left">
                <div className="app__header__button">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MenuIcon/>}
                        onClick={onMenuButtonClicked}
                    >
                        Меню
                    </Button>
                </div>

                <div className="app__header__button">
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onSaveButtonClicked}
                    >
                        Сохранить
                    </Button>
                </div>
            </div>

            <div className="app__header__right">

            </div>


        </div>
    );
}

export default AppHeader;
