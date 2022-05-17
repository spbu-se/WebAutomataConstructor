import React, { FC, useEffect, useState } from "react";
import "./MePage.css";
import {
    Container,
    Stack,
    Typography,
    IconButton,
    TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody, DialogContentText, DialogContent, Button,
    InputAdornment,
    OutlinedInput,
    Alert,
    Box,
    TextField,
    DialogActions,
} from "@mui/material";
import { UserModel } from "../../../Models/UserModel";
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ApiGetSaves from "../../../Api/apiGetSaves";
import { SaveModel } from "../../../Models/SaveModel";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import ApiRemoveSave, { RemoveSaveRequest } from "../../../Api/apiRemoveSave";
import CloudSavesManager from "../../../SavesManager/CloudSavesManager";
import { ComputerType, graph } from "../../../react-graph-vis-types";
import { useNavigate } from "react-router-dom";
import ApiUpdateSave, { UpdateSaveRequest } from "../../../Api/apiUpdateSave";
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ApiUpdateUser, { UpdateUserRequest } from "../../../Api/apiUpdateUser";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

interface MePageProps {
    user: UserModel | null,
    onAuthFailed: () => void,
    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void,
    setUser: (user: UserModel) => void,
}

const MePage: FC<MePageProps> = ({ user, onAuthFailed, changeComputerType, setUser }) => {
    const [saves, setSaves] = useState<SaveModel[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
    const [saveToRemoveId, setSaveToRemoveId] = useState<string | null>(null);
    const [editAccountMode, setEditAccountMode] = useState<boolean>(false);
    const [editedAbout, setEditedAbout] = useState<string>(user?.about ?? "");
    const [editSaveDialogOpen, setEditSaveDialogOpen] = useState<boolean>(false);
    const [saveToEditId, setSaveToEditId] = useState<string | null>(null);
    const [editedSaveName, setEditedSaveName] = useState<string | null>(null);

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
        const save = await cloudSavesManager.getSave({ id: id, name: name });

        if (save) {
            changeComputerType(save.save.type, save.save.graph);
            navigate("/");
        }
    }

    const onShareClicked = (id: string, isShared: boolean) => {
        setSaveShareState(id, !isShared).then(updateSaves);
        if (!isShared) {
            setShareDialogOpen(true);
        }
    }

    const onCopyShareLinkClicked = () => {
        navigator.clipboard.writeText(`https://spbu-se.github.io/WebAutomataConstructor/#/user/${user?.id}`);
    }

    const onEditAccountClicked = async () => {
        if (!editAccountMode) {
            setEditAccountMode(true);
        } else {
            await saveAccountChanges();
            setEditAccountMode(false);
        }
    }

    const onAboutChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEditedAbout(value);
    }

    const onEditSaveClicked = (id: string, name: string) => {
        setSaveToEditId(id);
        setEditedSaveName(name);
        setEditSaveDialogOpen(true);
    }

    const onEditedSaveNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEditedSaveName(value);
    }

    const onSaveEditConfirmed = () => {
        const request: UpdateSaveRequest = {
            name: editedSaveName!,
        };

        ApiUpdateSave(saveToEditId!, request, () => {}).then(async () =>{ await updateSaves(); closeEditSaveDialog()});
    }

    const saveAccountChanges = async () => {
        if (editedAbout != user?.about) {
            var request: UpdateUserRequest = {
                about: editedAbout,
            }

            ApiUpdateUser(request).then(updatedUser => {
                setUser(updatedUser);
            });
        }
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const closeShareDialog = () => {
        setShareDialogOpen(false);
    }

    const closeEditSaveDialog = () => {
        setEditSaveDialogOpen(false);
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

    const setSaveShareState = async (id: string, shareState: boolean) => {
        const request: UpdateSaveRequest = {
            isShared: shareState,
        }

        await ApiUpdateSave(id, request, onAuthFailed);
    }

    useEffect(() => {
        updateSaves();
    }, [])

    useEffect(() => {
        setEditedAbout(user?.about ?? "");
    }, [user])

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

            <Dialog open={shareDialogOpen} onClose={closeShareDialog} maxWidth="md" fullWidth>
                <DialogTitle>Настройки доступа</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Доступно всем пользователям по ссылке. Закрыть доступ можно в профиле пользователя.
                    </DialogContentText>
                    <OutlinedInput
                        sx={{ mt: 2 }}
                        readOnly
                        fullWidth
                        value={`https://spbu-se.github.io/WebAutomataConstructor/#/user/${user.id}`}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={onCopyShareLinkClicked} edge="end">
                                    <ContentCopyOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </DialogContent>
                <DialogContent>
                    <Button onClick={() => closeShareDialog()}>Ок</Button>
                </DialogContent>
            </Dialog>

            <Dialog open={editSaveDialogOpen} onClose={closeEditSaveDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Редактирование сохранения</DialogTitle>
                <DialogContent>
                    <TextField sx={{ mt: 1 }} label="Название" fullWidth size="small" value={editedSaveName} onChange={onEditedSaveNameChanged}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onSaveEditConfirmed()}>Сохранить</Button>
                    <Button onClick={() => closeEditSaveDialog()}>Отменить</Button>
                </DialogActions>
            </Dialog>

            <Container>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h5">Аккаунт</Typography>
                        <Stack>
                            <Typography variant="body1">Имя пользователя: {user.userName}</Typography>
                            {
                                !editAccountMode &&
                                <Typography variant="body1">О себе: {user.about}</Typography>
                            }
                            {
                                editAccountMode &&
                                <TextField sx={{ mt: 1 }} size="small" label="О себе" value={editedAbout} onChange={onAboutChanged} />
                            }
                        </Stack>
                        <Box>
                            <Button size="small" onClick={() => onEditAccountClicked()}>
                                {editAccountMode ? "Сохранить" : "Редактировать"}
                            </Button>
                        </Box>
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
                                            <TableCell>Поделиться</TableCell>
                                            <TableCell>Открыть</TableCell>
                                            <TableCell>Редактировать</TableCell>
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
                                                        <Button size="small" onClick={() => onShareClicked(save.id, save.isShared)}>
                                                            {save.isShared ? "Закрыть доступ" : "Поделиться"}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => onOpenClicked(save.id, save.name)}>
                                                            <LaunchOutlinedIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => onEditSaveClicked(save.id, save.name)}>
                                                            <EditOutlinedIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => onRemoveButtonClicked(save.id)}>
                                                            <DeleteOutlineRoundedIcon />
                                                        </IconButton>
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
                                Сохранённых вычислетелей ещё нет
                            </Alert>
                        }
                    </Stack>
                </Stack>
            </Container>
        </div>
    )
};

export default MePage;