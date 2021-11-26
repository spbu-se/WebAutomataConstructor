import React, {useEffect, useState} from "react";

import {ComputerType, graph} from "../../react-graph-vis-types";
import {computersInfo} from "../../utils";

import BrowserSavesManager from "../../SavesManager/BrowserSavesManager";
import {SaveMeta} from "../../SavesManager/Save";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";

import GitHubIcon from "@mui/icons-material/GitHub";

import "./ComputerTypePopout.css";

export interface ComputerTypePopoutProps {
    open: boolean,
    onClose: () => void

    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void,
}

export const ComputerTypePopout: React.FunctionComponent<ComputerTypePopoutProps> = (
    {
        open,
        onClose,
        changeComputerType
    }) => {
    const browserSavesManager = new BrowserSavesManager();

    const onSaveClicked = async (saveMeta: SaveMeta) => {
        let save = await (new BrowserSavesManager()).getSave(saveMeta);

        if (save) {
            changeComputerType(save.save.type, save.save.graph);
        }

        onClose();
    }

    const onCreateTemplateClicked = (type: ComputerType) => {
        changeComputerType(type, null);
        onClose();
    }

    const onCreateEmptyClicked = (type: ComputerType) => {
        changeComputerType(type, {nodes: [], edges: []});
        onClose();
    }

    const updateSavesMeta = async () => {
        setSavesMeta(await browserSavesManager.getSavesMeta())
    }

    const [savesMeta, setSavesMeta] = useState<SaveMeta[]>([]);

    useEffect(() => {
        updateSavesMeta();
    }, [open]);


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <p>Симулятор автоматов</p>
            </DialogTitle>

            <DialogContent>
                <div>
                    <div className="computer-type-popout__section">
                        <Typography
                            variant="subtitle1"
                            gutterBottom
                        >
                            Сохранения
                        </Typography>

                        <div className="computer-type-popout__savings__container">
                            {
                                savesMeta.map(saveMeta => (
                                    <Paper
                                        key={saveMeta.id}
                                        className="computer-type-popout__saving"
                                        variant="outlined"
                                        onClick={() => onSaveClicked(saveMeta)}
                                    >
                                        {saveMeta.name}
                                    </Paper>
                                ))
                            }
                        </div>
                    </div>

                    <div className="computer-type-popout__section">
                        <Typography
                            variant="subtitle1"
                            gutterBottom
                        >
                            Шаблоны
                        </Typography>

                        <div className="computer-type-popout__templates__container">
                            {
                                Object.entries(computersInfo).map((entry, index) =>
                                    <div key={index} className="computer-type-popout__templates__card">
                                        <img className="computer-type-popout__templates__card__preview"
                                             src={`media/images/${entry[1].preview}`}
                                             alt={`${entry[1].name} preview`}
                                        />
                                        <div className="computer-type-popout__templates__card__name">
                                            {entry[1].name}
                                        </div>
                                        <div className="computer-type-popout__templates__card__description">
                                            {entry[1].description}
                                        </div>

                                        <div className="computer-type-popout__templates__card__create-buttons">
                                            <Button
                                                className="computer-type-popout__templates__card__create-button"
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                fullWidth
                                                onClick={() => onCreateTemplateClicked(entry[0] as ComputerType)}
                                            >
                                                Создать
                                            </Button>

                                            <Button
                                                className="computer-type-popout__templates__card__create-button"
                                                color="primary"
                                                size="small"
                                                fullWidth
                                                onClick={() => onCreateEmptyClicked(entry[0] as ComputerType)}
                                            >
                                                Создать пустым
                                            </Button>
                                        </div>

                                    </div>
                                )
                            }
                        </div>
                    </div>

                    <div className="computer-type-popout__section">
                        <Typography
                            variant="subtitle1"
                            gutterBottom
                        >
                            Проект
                        </Typography>

                        <div className="computer-type-popout__credits__line">
                            <div className="computer-type-popout__credits__line__icon">
                                <GitHubIcon/>
                            </div>
                            <div className="computer-type-popout__credits__line__link">
                                <a href="https://github.com/spbu-se/WebAutomataConstructor">https://github.com/spbu-se/WebAutomataConstructor</a>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ComputerTypePopout;
