import React, {FC, useEffect, useState} from "react";
import "./MePage.css";
import {
    Container,
    Stack,
    Typography,
    IconButton,
    TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody, DialogContentText, DialogContent, Button
} from "@mui/material";
import {UserModel} from "../../../Models/UserModel";
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ApiGetSaves from "../../../Api/apiGetSaves";
import {SaveModel} from "../../../Models/SaveModel";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import ApiRemoveSave, {RemoveSaveRequest} from "../../../Api/apiRemoveSave";
import CloudSavesManager from "../../../SavesManager/CloudSavesManager";
import {ComputerType, graph} from "../../../react-graph-vis-types";
import {useNavigate} from "react-router-dom";

interface MePageProps {
    user: UserModel | null,
    onAuthFailed: () => void,
    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void
}

const MePage: FC<MePageProps> = ({user, onAuthFailed, changeComputerType}) => {
    const [saves, setSaves] = useState<SaveModel[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [saveToRemoveId, setSaveToRemoveId] = useState<string | null>(null);

    const navigate = useNavigate();

    const cloudSavesManager = new CloudSavesManager(onAuthFailed);

    const onRemoveButtonClicked = (id: string) => {
        setSaveToRemoveId(id);
        setOpen(true);
    }

    const onRemoveConfirmClicked = async () => {
        if (saveToRemoveId) {
            await removeSave(saveToRemoveId);
        }
        await updateSaves();
        closeDialog();
    }

    const onRemoveCancelClicked = () => {
        closeDialog();
    }

    const onOpenClicked = async (id: string, name: string) => {
        const save = await cloudSavesManager.getSave({id: id, name: name});

        if (save) {
            changeComputerType(save.save.type, save.save.graph);
            navigate("/");
        }
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const updateSaves = async () => {
        await ApiGetSaves(onAuthFailed)
            .then(saves => setSaves(saves))
            .catch(() => setSaves([]));
    }

    const removeSave = async (id: string) => {
        const request: RemoveSaveRequest = {
            id: id,
        };

        await ApiRemoveSave(request, onAuthFailed);
    }

    useEffect(() => {
        updateSaves();
    }, [])

    return (
        user &&
        <div className="me-page">
            <Dialog open={open} onClose={closeDialog}>
                <DialogTitle>Удаление сохранения</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить выбранное сохранение?
                    </DialogContentText>
                </DialogContent>
                <DialogContent>
                    <Button onClick={() => onRemoveConfirmClicked()}>Удалить</Button>
                    <Button onClick={() => onRemoveCancelClicked()}>Не удалять</Button>
                </DialogContent>
            </Dialog>

            <Container>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h5">Аккаунт</Typography>
                        <Stack>
                            <Typography variant="body1">Имя пользователя: {user.userName}</Typography>
                            <Typography variant="body1">О себе: {user.about}</Typography>
                        </Stack>
                    </Stack>
                    <Stack spacing={1}>
                        <Typography variant="h5">Сохранения</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Название</TableCell>
                                        <TableCell>Время создания</TableCell>
                                        <TableCell>Время изменения</TableCell>
                                        <TableCell>Открыть</TableCell>
                                        <TableCell>Удалить</TableCell>
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
                                                    <IconButton onClick={() => onOpenClicked(save.id, save.name)}>
                                                        <LaunchOutlinedIcon/>
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => onRemoveButtonClicked(save.id)}>
                                                        <DeleteOutlineRoundedIcon/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Stack>
            </Container>
        </div>
    )
};

export default MePage;