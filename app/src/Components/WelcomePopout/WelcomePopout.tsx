import React, {useEffect, useState} from "react";

import {ComputerType, graph} from "../../react-graph-vis-types";
import {computersInfo} from "../../utils";

import BrowserSavesManager from "../../SavesManager/BrowserSavesManager";
import CloudSavesManager from "../../SavesManager/CloudSavesManager";
import {SaveMeta} from "../../SavesManager/Save";

import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";

import GitHubIcon from "@mui/icons-material/GitHub";

import "./WelcomePopout.css";
import {IconButton} from "@mui/material";

export interface WelcomePopoutProps {
    open: boolean,
    onClose: () => void

    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void,
}

export const WelcomePopout: React.FunctionComponent<WelcomePopoutProps> = (
    {
        open,
        onClose,
        changeComputerType
    }) => {
    const browserSavesManager = new BrowserSavesManager();
    const cloudSavesManager = new CloudSavesManager();

    const onCreateTemplateClicked = (type: ComputerType) => {
        changeComputerType(type, null);
        onClose();
    }

    const onCreateEmptyClicked = (type: ComputerType) => {
        changeComputerType(type, {nodes: [], edges: []});
        onClose();
    }

    const onCloudSaveOpenClicked = async (saveMeta: SaveMeta) => {
        const save = await cloudSavesManager.getSave(saveMeta);

        if (save) {
            changeComputerType(save.save.type, save.save.graph);
            onClose();
        }
    }

    const onBrowserSaveOpenClicked = async (saveMeta: SaveMeta) => {
        const save = await browserSavesManager.getSave(saveMeta);

        if (save) {
            changeComputerType(save.save.type, save.save.graph);
            onClose();
        }
    }

    const updateCloudSavesMeta = async () => {
        setLoadingCloudSavesMeta(true);

        const savesMeta = await cloudSavesManager.getSavesMeta();
        setCloudSavesMeta(savesMeta);

        setLoadingCloudSavesMeta(false);
    }

    const updateBrowserSavesMeta = async () => {
        const savesMeta = await browserSavesManager.getSavesMeta();
        setBrowserSavesMeta(savesMeta);
    }

    const [cloudSavesMeta, setCloudSavesMeta] = useState<SaveMeta[]>([]);
    const [browserSavesMeta, setBrowserSavesMeta] = useState<SaveMeta[]>([]);
    const [loadingCloudSavesMeta, setLoadingCloudSavesMeta] = useState(false);

    useEffect(() => {
        if (open) {
            updateBrowserSavesMeta();
            updateCloudSavesMeta();
        }
    }, [open]);


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <p>Симулятор автоматов</p>
            </DialogTitle>

            <DialogContent>
                <Paper
                    className="welcome-popout__body"
                    variant="outlined"
                >
                    <List dense>
                        {
                            cloudSavesMeta.length !== 0 ?
                                <ListSubheader>
                                    Открыть сохранение в облаке
                                </ListSubheader>
                                : null
                        }

                        {
                            loadingCloudSavesMeta
                                ?
                                <div className="welcome-popout__body__cloud-skeleton">
                                    <Skeleton
                                        className="welcome-popout__body__cloud-skeleton__rectangle"
                                        animation="wave"
                                        variant="rectangular"
                                        height={28}
                                    />

                                    <Skeleton
                                        className="welcome-popout__body__cloud-skeleton__rectangle"
                                        animation="wave"
                                        variant="rectangular"
                                        height={28}
                                    />

                                    <Skeleton
                                        className="welcome-popout__body__cloud-skeleton__rectangle"
                                        animation="wave"
                                        variant="rectangular"
                                        height={28}
                                    />
                                </div>
                                :
                                cloudSavesMeta.length !== 0 ?
                                    cloudSavesMeta.map(saveMeta => (
                                        <ListItem
                                            key={saveMeta.id}
                                            secondaryAction={
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => onCloudSaveOpenClicked(saveMeta)}
                                                >
                                                    Открыть
                                                </Button>
                                            }
                                        >
                                            <ListItemText>
                                                {saveMeta.name}
                                            </ListItemText>
                                        </ListItem>
                                    ))
                                    : null
                        }

                        {
                            browserSavesMeta.length !== 0 ?
                                <ListSubheader>
                                    Открыть сохранение в браузере
                                </ListSubheader>
                                : null
                        }

                        {
                            browserSavesMeta.length !== 0 ?
                                browserSavesMeta.map(saveMeta => (
                                    <ListItem
                                        key={saveMeta.id}
                                        secondaryAction={
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => onBrowserSaveOpenClicked(saveMeta)}
                                            >
                                                Открыть
                                            </Button>
                                        }
                                    >
                                        <ListItemText>
                                            {saveMeta.name}
                                        </ListItemText>
                                    </ListItem>
                                ))
                                : null
                        }

                        <ListSubheader>
                            Создать новый вычислитель
                        </ListSubheader>
                        {
                            Object.entries(computersInfo).map(entry => (
                                <ListItem
                                    key={entry[1].name}
                                    secondaryAction={
                                        <div>
                                            <Button
                                                className="welcome-popout__create-empty-button"
                                                variant="text"
                                                size="small"
                                                onClick={() => onCreateEmptyClicked(entry[0] as ComputerType)}
                                            >
                                                Создать пустым
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => onCreateTemplateClicked(entry[0] as ComputerType)}
                                            >
                                                Создать
                                            </Button>
                                        </div>
                                    }
                                >
                                    <ListItemText primary={entry[1].name} secondary={entry[1].description}/>
                                </ListItem>
                            ))
                        }
                    </List>
                </Paper>

                <div className="welcome-popout__footer">
                    <IconButton href="https://github.com/spbu-se/WebAutomataConstructor">
                        <GitHubIcon className="welcome-popout__github-icon"/>
                    </IconButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default WelcomePopout;
