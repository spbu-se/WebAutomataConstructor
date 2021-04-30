import React, {AllHTMLAttributes, ReactNode} from "react";
import "./SavingPopout.css";
import {ComputerType, graph} from "../../react-graph-vis-types";
import PopoutWrapper from "../PopoutWrapper/PopoutWrapper";
import {Button, FormControl, TextField} from "@material-ui/core";
import Loader from "../../Loader";

export interface SavingPopoutProps extends AllHTMLAttributes<HTMLElement> {
    computerType: ComputerType,
    graph: graph,
    changePopout: (popout: ReactNode | null) => void
}

interface SavingPopoutState {
    name: string,
    nameError: string | null
}

class SavingPopout extends React.Component<SavingPopoutProps, SavingPopoutState> {
    constructor(props: SavingPopoutProps) {
        super(props);

        this.state = {
            name: "",
            nameError: null
        }
    }

    changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({name: event.target.value, nameError: null});
    }

    close = () => {
        this.props.changePopout(null);
    }

    save = () => {
        if (this.state.name.length === 0) {
            this.setState({nameError: "Имя сохранения не должно быть пустым"});
            return;
        }

        Loader.Save(this.state.name, this.props.graph, this.props.computerType);

        this.close();
    }

    render() {
        return (
            <PopoutWrapper>
                <div className="saving-popout">
                    <div className="saving-popout__name">
                        <FormControl fullWidth>
                            <TextField
                                label="Название сохранения"
                                value={this.state.name}
                                onChange={this.changeName}
                                error={this.state.nameError !== null}
                                helperText={this.state.nameError}
                            />
                        </FormControl>
                    </div>
                    <div className="saving-popout__buttons">
                        <Button
                            className="saving-popout__button"
                            variant="contained"
                            color="default"
                            onClick={this.close}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="saving-popout__button"
                            variant="contained"
                            color="primary"
                            onClick={this.save}
                        >
                            Сохранить
                        </Button>
                    </div>
                </div>
            </PopoutWrapper>
        )
    }
}

export default SavingPopout;