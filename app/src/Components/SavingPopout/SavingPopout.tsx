import React, {useEffect, useState} from "react";

import {ComputerType, graph} from "../../react-graph-vis-types";

import BrowserSavesManager from "../../SavesManager/BrowserSavesManager";
import Save from "../../SavesManager/Save";

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

import "./SavingPopout.css";

export interface SavingPopoutProps {
    open: boolean,
    onClose: () => void

    computerType: ComputerType,
    graph: graph,
}

export const SavingPopout: React.FunctionComponent<SavingPopoutProps> = (
    {
        open,
        onClose,
        graph,
        computerType
    }) => {
    const onSavesOriginChanged = (_: React.MouseEvent<HTMLElement>, value: string) => {
        value = value || savesOrigin;
        setSavesOrigin(value);
    }

    const onSaveNameClicked = (_: React.MouseEvent<HTMLDivElement>, value: string) => {
        setSaveName(value);
    }

    const onSaveNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSaveName(value);
    }

    const onSaveClicked = (_: React.MouseEvent<HTMLButtonElement>) => {
        switch (savesOrigin) {
            case "cloud":
                break;
            case "browser":
                browserSavesManager.save(new Save(saveName, graph, computerType));
                break;
            default:
                break;
        }
        updateNames();
        onClose();
    }

    const updateNames = () => {
        switch (savesOrigin) {
            case "cloud":
                setSavesNames(["cloud save mock name #1", "cloud save mock name #2", "cloud save mock name #3", "cloud save mock name #4", "cloud save mock name #5", "cloud save mock name #6"]);
                break;
            case "browser":
                setSavesNames(browserSavesManager.getSavesNames());
                break;
            default:
                setSavesNames([]);
                break;
        }
    }

    const [browserSavesManager, _] = useState<BrowserSavesManager>(new BrowserSavesManager());
    const [savesOrigin, setSavesOrigin] = useState<string>("cloud");
    const [savesNames, setSavesNames] = useState<string[]>([]);
    const [saveName, setSaveName] = useState<string>("");

    useEffect(() => {
        updateNames();
    }, [savesOrigin]);

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
                            <ToggleButton value="cloud">Облако</ToggleButton>
                            <ToggleButton value="browser">Браузер</ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <div className="saving-popout__body__main">
                        <Paper
                            className="saving-popout__body__main__paper"
                            variant="outlined"
                        >
                            <List dense>
                                {
                                    savesNames.map(saveName => (
                                        <ListItem
                                            key={saveName}
                                            disablePadding
                                        >
                                            <ListItemButton onClick={(e) => onSaveNameClicked(e, saveName)}>
                                                <ListItemText primary={saveName}/>
                                            </ListItemButton>
                                        </ListItem>
                                    ))
                                }
                            </List>
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