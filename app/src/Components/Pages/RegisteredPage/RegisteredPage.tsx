import React, {FC} from "react";
import "./RegisteredPage.css";
import {Button, Container, Stack, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

interface RegisteredPageProps {
}

const RegisteredPage: FC<RegisteredPageProps> = ({}) => {

    const navigate = useNavigate();

    const onLoginClicked = () => {
        navigate("/login");
    }

    return (
        <div className="registered-page">
            <Container maxWidth="xs">
                <Stack
                    spacing={1}
                    justifyContent="center"
                    style={{minHeight: '100vh'}}
                >
                    <Typography variant="h5" align="center" sx={{paddingBottom: "24px"}}>
                        Новый аккаунт создан
                    </Typography>

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

export default RegisteredPage;