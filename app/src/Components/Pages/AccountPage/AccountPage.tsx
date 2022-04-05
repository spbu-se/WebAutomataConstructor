import React, {FC, useEffect, useState} from "react";
import "./AccountPage.css";
import {Box, Button, TextField, Typography} from "@mui/material";
import apiGetUser from "../../../Api/apiGetUser";
import {User} from "../../../User";
import apiUpdateUsername from "../../../Api/apiUpdateUsername";
import apiUpdateUser from "../../../Api/apiUpdateUser";

interface AccountPageProps {
    onAuthFailed: () => void
}

const AccountPage: FC<AccountPageProps> = ({onAuthFailed}) => {
    let [user, setUser] = useState<User | null>(null);
    let [inEditMode, setEditMode] = useState(false);
    let [inEditUsername, setInEditUsername] = useState<string>("");
    let [inEditName, setInEditName] = useState<string>("");

    const getUser = async () => {
        let user = null;

        try {
            user = await apiGetUser(onAuthFailed);
        } catch (error) {
            console.error(error);
        }

        setUser(user);
    }

    const onEditProfileButtonClick = async () => {
        if (inEditMode) {
            if (inEditUsername != user?.username) {
                await apiUpdateUsername({username: inEditUsername}, onAuthFailed);
            }
            if (inEditName != user?.name) {
                await apiUpdateUser({name: inEditName}, onAuthFailed);
            }
            let updatedUser = Object.assign({}, user);
            updatedUser.username = inEditUsername;
            updatedUser.name = inEditName;
            setUser(updatedUser);
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    }

    const onInEditUsernameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInEditUsername(value);
    }

    const onInEditNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInEditName(value);
    }

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        setInEditUsername(user?.username ?? "");
    }, [user])

    useEffect(() => {
        setInEditName(user?.name ?? "");
    }, [user])

    return (
        <div className="account-page">
            <div className="account-page__container">
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Профиль
                    </Typography>

                    {
                        inEditMode
                            ?
                            <div className="account-page__user-field">
                                <TextField value={inEditUsername} onChange={onInEditUsernameChanged} size="small"/>
                            </div>
                            :
                            <Typography variant="h6">
                                {user?.username}
                            </Typography>
                    }

                    {
                        inEditMode
                            ?
                            <div className="account-page__user-field">
                                <TextField value={inEditName} onChange={onInEditNameChanged} size="small"/>
                            </div>
                            :
                            <Typography variant="subtitle1">
                                {user?.name}
                            </Typography>
                    }


                    <Button onClick={onEditProfileButtonClick}>
                        {
                            inEditMode
                                ?
                                "Сохранить изменения"
                                :
                                "Редактировать профиль"
                        }
                    </Button>
                </Box>
            </div>
        </div>
    )
};

export default AccountPage;