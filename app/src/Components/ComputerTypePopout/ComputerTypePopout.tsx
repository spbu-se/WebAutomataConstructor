import React, {AllHTMLAttributes} from "react";
import "./ComputerTypePopout.css";
import PopoutWrapper from "../PopoutWrapper/PopoutWrapper";
import GitHubIcon from "@mui/icons-material/GitHub";
import {computersInfo} from "../../utils";
import {ComputerType, graph} from "../../react-graph-vis-types";
import {Button, Paper} from "@mui/material";
import Loader, {Saving} from "../../Loader";

interface ComputerTypePopoutProps extends AllHTMLAttributes<HTMLElement> {
    changeComputerType: (computerType: null | ComputerType, graph: graph | null) => void
}

interface ComputerTypePopoutState {
    savings: Saving[]
}

class ComputerTypePopout extends React.Component<ComputerTypePopoutProps, ComputerTypePopoutState> {
    constructor(props: ComputerTypePopoutProps) {
        super(props);

        this.state = {
            savings: [],
        }
    }

    componentDidMount() {
        this.setState({savings: Loader.GetSavings()});
    }

    loadSaving = (saving: Saving) => {
        this.props.changeComputerType(saving.type, saving.graph);
    }

    render() {
        const {changeComputerType, className, style, ...restProps} = this.props;
        const {savings} = this.state;

        return (
            <PopoutWrapper
                className={"computer-type-popout__wrapper " + className}
                style={style}
                {...restProps}
            >
                <div className="computer-type-popout__content">
                    <div className="computer-type-popout__header">
                        Симулятор автоматов
                    </div>
                    <div className="computer-type-popout__sections">
                        <div className="computer-type-popout__savings">
                            <div className="computer-type-popout__section__header">
                                Сохранения
                            </div>
                            <div className="computer-type-popout__savings__container">
                                {
                                    savings.map((saving, index) => (
                                        <Paper
                                            key={index}
                                            className="computer-type-popout__saving"
                                            variant="outlined"
                                            onClick={() => this.loadSaving(saving)}
                                        >
                                            {saving.name}
                                        </Paper>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="computer-type-popout__templates">
                            <div className="computer-type-popout__section__header">
                                Шаблоны
                            </div>
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
                                                    onClick={() => this.props.changeComputerType(entry[0] as ComputerType, null)}
                                                >
                                                    Создать
                                                </Button>

                                                <Button
                                                    className="computer-type-popout__templates__card__create-button"
                                                    color="primary"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => this.props.changeComputerType(entry[0] as ComputerType, {nodes: [], edges: []})}
                                                >
                                                    Создать пустым
                                                </Button>
                                            </div>

                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="computer-type-popout__credits">
                            <div className="computer-type-popout__section__header">
                                Проект
                            </div>
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
                </div>
            </PopoutWrapper>
        );
    }
}

export default ComputerTypePopout;