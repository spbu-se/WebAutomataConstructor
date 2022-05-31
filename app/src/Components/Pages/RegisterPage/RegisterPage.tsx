import React, {FC, useEffect, useState} from "react";
import "./RegisterPage.css";
import {Alert, Button, Container, Stack, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import ApiSignUp from "../../../Api/apiSignUp";

interface RegisterPageProps {
}

const RegisterPage: FC<RegisterPageProps> = ({}) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [about, setAbout] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const onEmailChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
    }

    const onPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
    }

    const onAboutChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAbout(value);
    }

    const onRegisterClicked = async () => {
        const request = {
            email: email,
            password: password,
            about: about,
        };

        await ApiSignUp(request)
            .then(() => navigate("/registered"))
            .catch(() => setError("Не удалось зарегистрировать нового пользователя"));
    }

    const onLoginClicked = () => {
        navigate("/login");
    }

    useEffect(() => {
        setError(null);
    }, [email, password, about]);

    return (
        <div className="login-page">
            <Container maxWidth="xs">
                <Stack
                    spacing={1}
                    justifyContent="center"
                    style={{minHeight: '100vh'}}
                >
                    <Typography variant="h5" align="center" sx={{paddingBottom: "24px"}}>Новый аккаунт</Typography>

                    {
                        error && <Alert severity="error">{error}</Alert>
                    }

                    <TextField size="small"
                               label="Электропочта"
                               type="email"
                               value={email}
                               onChange={onEmailChanged}
                    />

                    <TextField size="small"
                               label="Пароль"
                               type="password"
                               value={password}
                               onChange={onPasswordChanged}
                    />

                    <TextField label="О себе"
                               type="text"
                               multiline
                               rows={3}
                               value={about}
                               onChange={onAboutChanged}
                    />

                    <Button variant="contained"
                            onClick={onRegisterClicked}
                    >
                        Зарегистрироваться
                    </Button>

                    <Typography variant="overline" align="center">или</Typography>

                    <Button variant="outlined"
                            onClick={onLoginClicked}
                    >
                        Войти
                    </Button>
                </Stack>
            </Container>
        </div>
    )
};

export default RegisterPage;