import React, { useEffect, useState } from "react";

import { ComputerType, graph } from "../../react-graph-vis-types";

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

    // computerType: ComputerType,
    // graph: graph,
    // changePopout: (popout: React.ReactNode | null) => void
}

export const SavingPopout: React.FunctionComponent<SavingPopoutProps> = ({ open, onClose }) => {
    const onSavesOriginChanged = (_: React.MouseEvent<HTMLElement>, value: any) => {
        value = value || savesOrigin;
        setSavesOrigin(value);
    }

    const [savesOrigin, setSavesOrigin] = useState<string>("cloud");
    const [savesNames, setSavesNames] = useState<string[]>([]);

    useEffect(() => {
        switch (savesOrigin) {
            case "cloud":
                setSavesNames(["cloud save mock name #1", "cloud save mock name #2", "cloud save mock name #3", "cloud save mock name #4", "cloud save mock name #5", "cloud save mock name #6"]);
                break;
            case "browser":
                setSavesNames(["browser save mock name #1", "browser save mock name #2", "browser save mock name #3"]);
                break;
            default:
                setSavesNames([]);
                break;
        }
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
                                            <ListItemButton>
                                                <ListItemText primary={saveName} />
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
                />

                <DialogActions>
                    <Button
                        color="primary"
                    >
                        Сохранить
                    </Button>

                    <Button
                        color="primary"
                    >
                        Отмена
                    </Button>
                </DialogActions>

            </DialogContent>
        </Dialog>
    );
}

export default SavingPopout;