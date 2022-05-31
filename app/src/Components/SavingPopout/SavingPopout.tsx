import React, {useEffect, useState} from "react";

import {ComputerType, graph} from "../../react-graph-vis-types";

import BrowserSavesManager from "../../SavesManager/BrowserSavesManager";
import CloudSavesManager from "../../SavesManager/CloudSavesManager";
import {SaveMeta} from "../../SavesManager/Save";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

import "./SavingPopout.css";

export interface SavingPopoutProps {
    open: boolean,
    onClose: () => void,
    isLogin: boolean,
    onAuthFailed: () => void,

    computerType: ComputerType,
    graph: graph,
}

export const SavingPopout: React.FunctionComponent<SavingPopoutProps> = (
    {
        open,
        onClose,
        isLogin,
        onAuthFailed,
        graph,
        computerType
    }) => {
    const onSavesOriginChanged = (_: React.MouseEvent<HTMLElement>, value: string) => {
        value = value || savesOrigin;
        setSavesOrigin(value);
    }

    const onSaveNameClicked = (_: React.MouseEvent<HTMLDivElement>, saveMeta: SaveMeta) => {
        setSaveName(saveMeta.name);
    }

    const onSaveNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSaveName(value);
    }

    const onSaveClicked = (_: React.MouseEvent<HTMLButtonElement>) => {
        switch (savesOrigin) {
            case "cloud":
                cloudSavesManager.save(saveName, graph, computerType);
                break;
            case "browser":
                browserSavesManager.save(saveName, graph, computerType);
                break;
            default:
                break;
        }

        updateNames();
        onClose();
    }

    const updateNames = async () => {
        setLoadingSavesMeta(true);

        let savesMeta: SaveMeta[] = [];

        switch (savesOrigin) {
            case "cloud":
                savesMeta = await cloudSavesManager.getSavesMeta();
                break;
            case "browser":
                savesMeta = await browserSavesManager.getSavesMeta();
                break;
            default:
                setSavesMeta([]);
                break;
        }

        setSavesMeta(savesMeta);
        setLoadingSavesMeta(false);
    }

    const updateDefaultOrigin = () => {
        setSavesOrigin(isLogin ? "cloud" : "browser");
    }

    const [browserSavesManager] = useState<BrowserSavesManager>(new BrowserSavesManager());
    const [cloudSavesManager] = useState<CloudSavesManager>(new CloudSavesManager(onAuthFailed));
    const [savesOrigin, setSavesOrigin] = useState<string>(isLogin ? "cloud" : "browser");
    const [savesMeta, setSavesMeta] = useState<SaveMeta[]>([]);
    const [loadingSavesMeta, setLoadingSavesMeta] = useState<boolean>(false);
    const [saveName, setSaveName] = useState<string>("");

    useEffect(() => {
        if (open) {
            updateDefaultOrigin();
            updateNames();
        }
    }, [open]);

    useEffect(() => {
        updateNames();
    }, [savesOrigin]);

    useEffect(() => {
        setSaveName("");
    }, [savesOrigin, open]);


    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <p>Сохранение</p>
            </DialogTitle>

            <DialogContent>
                <div className="saving-popout__body">
                    <div className="saving-popout__body__sidebar">
                        <ToggleButtonGroup
                            orientation="vertical"
                            exclusive
                            value={savesOrigin}
                            onChange={onSavesOriginChanged}
                        >
                            <ToggleButton value="cloud" disabled={!isLogin}>Облако</ToggleButton>
                            <ToggleButton value="browser">Браузер</ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <div className="saving-popout__body__main">
                        <Paper
                            className="saving-popout__body__main__paper"
                            variant="outlined"
                        >
                            {
                                loadingSavesMeta
                                    ?
                                    <div className="saving-popout__body__main__skeleton">
                                        <Skeleton
                                            className="saving-popout__body__main__skeleton__bar"
                                            animation="wave"
                                            variant="rectangular"
                                            height="36"
                                        />

                                        <Skeleton
                                            className="saving-popout__body__main__skeleton__bar"
                                            animation="wave"
                                            variant="rectangular"
                                            height="36"
                                        />

                                        <Skeleton
                                            className="saving-popout__body__main__skeleton__bar"
                                            animation="wave"
                                            variant="rectangular"
                                            height="36"
                                        />
                                    </div>
                                    :
                                    <List dense>
                                        {
                                            savesMeta.map(saveMeta => (
                                                <ListItem
                                                    key={saveMeta.id}
                                                    disablePadding
                                                >
                                                    <ListItemButton onClick={e => onSaveNameClicked(e, saveMeta)}>
                                                        <ListItemText primary={saveMeta.name}/>
                                                    </ListItemButton>
                                                </ListItem>
                                            ))
                                        }
                                    </List>
                            }

                        </Paper>
                    </div>
                </div>

                <TextField
                    className="saving-popout__save-name-input"
                    variant="standard"
                    size="small"
                    label="Имя сохранения"
                    value={saveName}
                    onChange={onSaveNameChanged}
                />

                <DialogActions>
                    <Button
                        color="primary"
                        onClick={onSaveClicked}
                    >
                        Сохранить
                    </Button>

                    <Button
                        color="primary"
                        onClick={onClose}
                    >
                        Отмена
                    </Button>
                </DialogActions>

            </DialogContent>
        </Dialog>
    );
}

export default SavingPopout;