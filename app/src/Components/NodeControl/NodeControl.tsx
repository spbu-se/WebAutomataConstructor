import React, {ChangeEvent} from "react";
import "./NodeControl.css";
import {node} from "../../react-graph-vis-types";
import ControlWrapper from "../ControlWrapper/ControlWrapper";

import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";

interface nodeControlProps {
    node: node | null,
    changeNodeLabel: (id: number, label: string) => void,
    changeStateIsAdmit: (id: number, isAdmit: boolean) => void,
    changeStateIsInitial: (id: number, isInitial: boolean) => void,
    deleteNode: (id: number) => void,
}

interface nodeControlState {
    prevNodeId: number | undefined,
    label: string,
    isAdmit: boolean,
    isInitial: boolean
}

class NodeControl extends React.Component<nodeControlProps, nodeControlState> {
    constructor(props: nodeControlProps) {
        super(props);

        this.state = {
            prevNodeId: this.props.node?.id,
            label: this.props.node?.label || "",
            isAdmit: this.props.node?.isAdmit || false,
            isInitial: this.props.node?.isInitial || false
        }
    }

    componentDidUpdate(prevProps: Readonly<nodeControlProps>, prevState: Readonly<nodeControlState>) {
        if (this.props.node?.id !== prevState.prevNodeId) {
            this.setState({
                label: this.props.node?.label || "",
                isAdmit: this.props.node?.isAdmit || false,
                isInitial: this.props.node?.isInitial || false,
                prevNodeId: this.props.node?.id
            });
        }
    }

    onLabelChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.node !== null) {
            this.props.changeNodeLabel(this.props.node.id, event.target.value);
            this.setState({label: event.target.value});
        }
    }

    onIsAdmitChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.node !== null) {
            this.props.changeStateIsAdmit(this.props.node.id, event.target.checked);
            this.setState({isAdmit: event.target.checked});
        }
    }

    onIsInitialChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.node !== null && !this.props.node.isAdmit) {
            this.props.changeStateIsInitial(this.props.node.id, event.target.checked);
            this.setState({isInitial: event.target.checked});
        }
    }

    onDeleteClick = (): void => {
        if (this.props.node !== null) {
            this.props.deleteNode(this.props.node.id);
        }
    }

    render() {
        return (
            <ControlWrapper title="State" visible={this.props.node !== null}>
                <FormControl>

                    <div className="node-control__item">
                        <TextField
                            label="Имя"
                            value={this.state.label}
                            onChange={this.onLabelChange}
                        />
                    </div>

                    <div className="node-control__item">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.isInitial}
                                    onChange={this.onIsInitialChanged}
                                />
                            }
                            label={"Начальное"}
                        />
                    </div>

                    <div className="node-control__item">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.isAdmit}
                                    onChange={this.onIsAdmitChanged}
                                />
                            }
                            label="Допускающее"
                        />
                    </div>

                    <div className="node-control__item">
                        <Button
                            color="secondary"
                            onClick={this.onDeleteClick}
                        >
                            Удалить
                        </Button>
                    </div>

                </FormControl>
            </ControlWrapper>
        )
    }
}

export default NodeControl;