import React from "react";
import {edge} from "../../react-graph-vis-types";
import {transitionsToLabel} from "../../utils";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import Button from "@material-ui/core/Button";
import "./EdgeControl.css";
import Transition from "./Transition/Transition";
import EditIcon from '@material-ui/icons/Edit';
import TextField from "@material-ui/core/TextField";

interface EdgeControlProps {
    edge: edge | null,
    changeEdgeTransitions: (id: string, transitions: Set<string>) => void,
    deleteEdge: (id: string) => void
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    transitions: Set<string>,
    activeTransition: string | null,
    editMode: boolean
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            transitions: this.props.edge?.transitions || new Set(),
            activeTransition: null,
            editMode: false
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {
            this.setState({
                transitions: this.props.edge?.transitions || new Set(),
                prevEdgeId: this.props.edge?.id,
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
        const transitions = new Set(value.split(","));

        this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
        this.setState({transitions: transitions});
    }

    deleteTransition = (): void => {
        if (this.props.edge !== null && this.state.activeTransition !== null) {
            const transitions = this.state.transitions;
            transitions.delete(this.state.activeTransition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({transitions: transitions});
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
    }

    render() {
        return (
            <ControlWrapper title="Transition" visible={this.props.edge !== null}>
                <div className="edge-control__container">
                    <div className="edge-control__item edge-control__transitions">
                        {
                            this.state.editMode ?
                                <TextField
                                    label="Transitions"
                                    value={transitionsToLabel(this.state.transitions)}
                                    onChange={this.changeTransitions}
                                    helperText="Comma-separated list of characters"
                                />
                                :
                                Array.from(this.state.transitions || []).map((transition, index) => (
                                    <Transition
                                        key={index}
                                        className="edge-control__transition"
                                        transition={transition}
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
                            color="secondary"
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

export default EdgeControl;