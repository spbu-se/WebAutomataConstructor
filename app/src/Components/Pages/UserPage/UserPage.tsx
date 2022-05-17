import React, { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiGetUserById from "../../../Api/apiGetUserById";
import ApiGetUserSaves from "../../../Api/apiGetUserSaves";
import { UserModel } from "../../../Models/UserModel";
import { SaveModel } from "../../../Models/SaveModel";
import "./UserPage.css";
import { Alert, Button, Container, Dialog, DialogContent, DialogContentText, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ApiCloneSave from "../../../Api/apiCloneSave";
import { ComputerType, graph } from "../../../react-graph-vis-types";
import CloudSavesManager from "../../../SavesManager/CloudSavesManager";



interface UserPageProps {
    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void
}


const UserPage: FC<UserPageProps> = ({ changeComputerType }) => {
    const [user, setUser] = useState<UserModel | null>(null);
    const [saves, setSaves] = useState<SaveModel[]>([]);
    const [cloneDialogOpen, setCloneDialogOpen] = useState<boolean>(false);
    const [saveToCloneId, setSaveToCloneId] = useState<string | null>(null);
    const [clonedSave, setClonedSave] = useState<SaveModel | null>(null);

    const { userId } = useParams();

    const cloudSavesManager = new CloudSavesManager(() => { });

    const navigate = useNavigate();


    const onCloneClicked = (id: string) => {
        setSaveToCloneId(id);
        setCloneDialogOpen(true);
    }

    const onCloneDialogClose = () => {
        setCloneDialogOpen(false);
    }

    const onCloneConfirmed = () => {
        cloneSave(saveToCloneId!);
    }

    const getUser = async () => {
        await ApiGetUserById(userId!)
            .then(user => { console.log(user); setUser(user) });
    }

    const getSaves = async () => {
        await ApiGetUserSaves(userId!)
            .then(saves => { console.log(saves); setSaves(saves) });
    }

    const cloneSave = async (id: string) => {
        await ApiCloneSave(id).then(async (response) => {
            const save = await cloudSavesManager.getSave({ id: response.id, name: response.name });

            if (save) {
                changeComputerType(save.save.type, save.save.graph);
                navigate("/");
            }
        })
    }

    useEffect(() => { getUser(); getSaves(); }, []);

    return (
        user &&
        <div className="me-page">
            <Dialog open={cloneDialogOpen} onClose={onCloneDialogClose}>
                <DialogTitle>Клонирование сохранения</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Копия сохранения появится в списке сохранений. Вы сможете изменять его независимо. Хотите продолжить?
                    </DialogContentText>
                </DialogContent>
                <DialogContent>
                    <Button onClick={() => onCloneConfirmed()}>Да, клонировать</Button>
                    <Button onClick={() => onCloneDialogClose()}>Нет</Button>
                </DialogContent>
            </Dialog>

            <Container>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h5">Аккаунт</Typography>
                        <Stack>
                            <Typography variant="body1">О себе: {user.about}</Typography>
                        </Stack>
                    </Stack>
                    <Stack spacing={1}>
                        <Typography variant="h5">Сохранения</Typography>
                        {
                            saves.length > 0 &&
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название</TableCell>
                                            <TableCell>Время создания</TableCell>
                                            <TableCell>Время изменения</TableCell>
                                            <TableCell>Клонирование</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            saves.map(save => (
                                                <TableRow key={save.id}>
                                                    <TableCell>
                                                        {save.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(save.createdDateTime).toLocaleString('ru-ru')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(save.lastModifiedDateTime).toLocaleString('ru-ru')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small" onClick={() => onCloneClicked(save.id)}>
                                                            Клонировать себе
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                        {
                            saves.length === 0 &&
                            <Alert severity="warning" icon={false}>
                                Пользователь ещё не поделился своими сохранениями
                            </Alert>
                        }
                    </Stack>
                </Stack>
            </Container>
        </div>
    )
};

export default UserPage;