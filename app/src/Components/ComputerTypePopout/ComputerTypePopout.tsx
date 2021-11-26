import React, {AllHTMLAttributes} from "react";
import "./ComputerTypePopout.css";
import GitHubIcon from "@mui/icons-material/GitHub";
import {computersInfo} from "../../utils";
import {ComputerType, graph} from "../../react-graph-vis-types";
import {Button, Dialog, DialogContent, Paper} from "@mui/material";
import BrowserSavesManager from "../../SavesManager/BrowserSavesManager";
import {SaveMeta} from "../../SavesManager/Save";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

interface ComputerTypePopoutProps extends AllHTMLAttributes<HTMLElement> {
    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void,
    open: boolean,
    onClose: () => void
}

interface ComputerTypePopoutState {
    savesMeta: SaveMeta[],
}

class ComputerTypePopout extends React.Component<ComputerTypePopoutProps, ComputerTypePopoutState> {
    constructor(props: ComputerTypePopoutProps) {
        super(props);

        this.state = {
            savesMeta: [],
        }
    }

    async componentDidMount() {
        this.setState({savesMeta: await (new BrowserSavesManager()).getSavesMeta()});
    }

    onSaveClicked = async (saveMeta: SaveMeta) => {
        let save = await (new BrowserSavesManager()).getSave(saveMeta);

        if (save) {
            this.props.changeComputerType(save.save.type, save.save.graph);
        }

        this.props.onClose();
    }

    onCreateTemplateClicked = (type: ComputerType) => {
        this.props.changeComputerType(type, null);
        this.props.onClose();
    }

    onCreateEmptyClicked = (type: ComputerType) => {
        this.props.changeComputerType(type, {nodes: [], edges: []});
        this.props.onClose();
    }

    render() {
        const {changeComputerType, open, onClose, className, style, ...restProps} = this.props;
        const {savesMeta} = this.state;

        return (

            <Dialog open={open} onClose={onClose} maxWidth="md">

                <DialogTitle>
                    <p>Симулятор автоматов</p>
                </DialogTitle>

                <DialogContent>
                    <div className="computer-type-popout__sections">
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
                                            onClick={() => this.onSaveClicked(saveMeta)}
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
                                                    onClick={() => this.onCreateTemplateClicked(entry[0] as ComputerType)}
                                                >
                                                    Создать
                                                </Button>

                                                <Button
                                                    className="computer-type-popout__templates__card__create-button"
                                                    color="primary"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => this.onCreateEmptyClicked(entry[0] as ComputerType)}
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
        // {/*</PopoutWrapper>*/
    }
}

export default ComputerTypePopout;