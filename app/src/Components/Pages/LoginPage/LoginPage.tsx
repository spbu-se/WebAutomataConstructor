import React, {FC, useEffect, useState} from "react";
import "./LoginPage.css";
import {Alert, Button, Container, Stack, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import ApiSignIn from "../../../Api/apiSignIn";

interface LoginPageProps {
}

const LoginPage: FC<LoginPageProps> = ({}) => {
    const authEndpoint = process.env.REACT_APP_BACKEND_BASE_URL + "/auth";

    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const onEmailChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
    }

    const onPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
    }

    const onLoginClicked = async () => {
        const request = {
            email: email,
            password: password,
        };

        await ApiSignIn(request)
            .then(jwt => navigate(`/success-login?jwt=${jwt}`))
            .catch(e => setError(`Не удалось войти в аккаунт (${e})`));
    }

    const onRegisterClicked = () => {
        navigate('/register');
    }

    const onSignInWithExternalProviderClicked = (provider: string) => {
        window.location.href = authEndpoint + `/external/signin?provider=${provider}`;
    }

    useEffect(() => {
        setError(null);
    }, [email, password]);

    return (
        <div className="login-page">
            <Container maxWidth="xs">
                <Stack
                    spacing={1}
                    justifyContent="center"
                    style={{minHeight: '100vh'}}
                >
                    <Typography variant="h5" align="center" sx={{paddingBottom: "24px"}}>Вход в аккаунт</Typography>

                    {
                        error && <Alert severity="error">{error}</Alert>
                    }

                    <TextField size="small"
                               label="Электропочта"
                               type="email"
                               value={email}
                               onChange={onEmailChanged}/>

                    <TextField size="small"
                               label="Пароль"
                               type="password"
                               value={password}
                               onChange={onPasswordChanged}/>

                    <Button variant="contained"
                            onClick={onLoginClicked}
                    >
                        Войти
                    </Button>

                    <Typography variant="overline" align="center">или</Typography>

                    <Button variant="outlined"
                            onClick={() => onSignInWithExternalProviderClicked("Google")}
                    >
                        Войти через аккаунт Google
                    </Button>

                    <Button variant="outlined"
                            onClick={() => onSignInWithExternalProviderClicked("Yandex")}
                    >
                        Войти через аккаунт Яндекс
                    </Button>

                    <Typography variant="overline" align="center">или</Typography>

                    <Button variant="outlined"
                            onClick={onRegisterClicked}
                    >
                        Зарегистрироваться
                    </Button>
                </Stack>
            </Container>
        </div>
    )
};

export default LoginPage;