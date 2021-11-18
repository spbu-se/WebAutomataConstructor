import React from "react";
import {ComputerType, edge} from "../../react-graph-vis-types";
import {transitionsToLabel} from "../../utils";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import Button from "@mui/material/Button";
import "./EdgeControl.css";
import Transition from "./Transition/Transition";
import EditIcon from '@mui/icons-material/Edit';
import TextField from "@mui/material/TextField";
import {withComputerType} from "../../hoc";
import {EPS} from "../../Logic/Computer";

interface EdgeControlProps {
    edge: edge | null,
    changeEdgeTransitions: (id: string, transitions: Set<string>) => void,
    deleteEdge: (id: string) => void,
    computerType: ComputerType | null
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    transitions: Set<string>,
    transitionsText: string,
    activeTransition: string | null,
    editMode: boolean
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            transitions: this.props.edge?.transitions || new Set(),
            transitionsText: transitionsToLabel(this.props.edge?.transitions || new Set()),
            activeTransition: null,
            editMode: false
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {
            this.setState({
                transitions: this.props.edge?.transitions || new Set(),
                prevEdgeId: this.props.edge?.id,
                transitionsText: transitionsToLabel(this.props.edge?.transitions || new Set()),
                activeTransition: null,
                editMode: false
            });
        }
    }

    deleteEdge = (): void => {
        if (this.props.edge !== null) {
            this.props.deleteEdge(this.props.edge.id!);
        }
    }

    changeTransitions = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        this.setState({transitionsText: value});

        if (value.slice(-1) === ",") {
            const transitions = new Set(value
                .split(",")
                .map(transition => transition === "eps" && this.props.computerType === "nfa-eps" ? EPS : transition));

            this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
            this.setState({transitionsText: transitionsToLabel(transitions)});
        }
    }

    deleteTransition = (): void => {
        if (this.props.edge !== null && this.state.activeTransition !== null) {
            const transitions = this.state.transitions;
            transitions.delete(this.state.activeTransition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({transitions: transitions, transitionsText: transitionsToLabel(transitions)});
        }
    }

    selectTransition = (transition: string | null): void => {
        if (this.state.activeTransition === transition) {
            this.setState({activeTransition: null});
        } else {
            this.setState({activeTransition: transition});
        }
    }

    changeEditMode = () => {
        this.setState({editMode: !this.state.editMode});
        this.updateTransitions();
    }

    updateTransitions = () => {
        const transitions = new Set(this.state.transitionsText
            .replace(/,$/, '')
            .split(",")
            .map(transition => transition === "eps" && this.props.computerType === "nfa-eps" ? EPS : transition));

        this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
        this.setState({transitionsText: transitionsToLabel(transitions), transitions: transitions})
    }

    render() {
        return (
            <ControlWrapper title="Переход" visible={this.props.edge !== null}>
                <div className="edge-control__container">
                    <div className="edge-control__item edge-control__transitions">
                        {
                            this.state.editMode ?
                                <TextField
                                    label="Переходы"
                                    size="small"
                                    value={this.state.transitionsText}
                                    onChange={this.changeTransitions}
                                    helperText={this.props.computerType === "nfa-eps" ? 'Список символов или "eps" через запятую' : "Список символов через запятую"}
                                    onBlur={this.updateTransitions}
                                />
                                :
                                Array.from(this.state.transitions || []).map((transition, index) => (
                                    <Transition
                                        key={index}
                                        className="edge-control__transition"
                                        transition={transition === EPS ? "ε" : transition}
                                        active={this.state.activeTransition === transition}
                                        deleteTransition={this.deleteTransition}
                                        onClick={() => this.selectTransition(transition)}
                                    />
                                ))
                        }

                        <div className="edge-control__edit-transitions"
                             onClick={this.changeEditMode}>
                            <EditIcon/>
                        </div>

                    </div>

                    <div className="edge-control__item">
                        <Button
                            onClick={this.deleteEdge}
                        >
                            Удалить
                        </Button>
                    </div>

                </div>
            </ControlWrapper>
        );
    }
}

export default withComputerType(EdgeControl);