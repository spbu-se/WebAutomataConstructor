import React from "react";

import {ComputerType, graph} from "../../react-graph-vis-types";

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

export const SavingPopout: React.FunctionComponent<SavingPopoutProps> = ({open, onClose}) => {
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
                            value="cloud"
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
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemText primary="парсер XML файлов"/>
                                    </ListItemButton>
                                </ListItem>

                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemText primary="Четное количество единиц"/>
                                    </ListItemButton>
                                </ListItem>

                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemText
                                            primary="Демонстрационный автомат 2021 курс 2 ММ-091246-343238-5-233223-43"/>
                                    </ListItemButton>
                                </ListItem>
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