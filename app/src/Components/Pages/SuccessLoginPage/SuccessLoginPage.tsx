import React, {useEffect, useState} from "react";

import {useSearchParams} from "react-router-dom";
import {useNavigate} from "react-router-dom";

import "./SuccessLoginPage.css";
import {Alert, Container, Stack, Typography} from "@mui/material";

export interface SuccessLoginPageProps {
}

export const SuccessLoginPage: React.FunctionComponent<SuccessLoginPageProps> = ({}) => {
    const [error, setError] = useState<string | null>(null);

    const updateAuth = () => {
        const jwt = searchParams.get('jwt');

        if (!jwt) {
            setError("Не удалось войти в аккаунт");
            return;
        }

        console.log(`Jwt = ${jwt}`);

        document.cookie = `jwt=${jwt}; path=/; secure; max-age=2592000`;
        window.location.href = "/";
    }

    useEffect(() => {
        updateAuth();
    }, []);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    return (
        <div className="success-login-page">
            <Container maxWidth="xs">
                <Stack
                    spacing={1}
                    justifyContent="center"
                    style={{minHeight: '100vh'}}
                >
                    <Typography variant="h5" align="center" sx={{paddingBottom: "24px"}}>Входим в аккаунт...</Typography>

                    {
                        error && <Alert severity="error">{error}</Alert>
                    }
                </Stack>
            </Container>
        </div>
    )
};

export default SuccessLoginPage;