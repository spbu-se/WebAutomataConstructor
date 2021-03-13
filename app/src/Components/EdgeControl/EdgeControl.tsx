import React, {ChangeEvent} from "react";
import {edge} from "../../react-graph-vis-types";
import {transitionsToLabel} from "../../utils";

interface EdgeControlProps {
    edge: edge | null,
    changeEdgeLabel: (id: string, label: string) => void,
    changeEdgeTransitions: (id: string, transitions: Set<string>) => void,
    deleteEdge: (id: string) => void
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    transitions: Set<string>,
    transition: string
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            transitions: this.props.edge?.transitions || new Set(),
            transition: ""
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {
            this.setState({transitions: this.props.edge?.transitions || new Set(), prevEdgeId: this.props.edge?.id});
        }
    }

    onTransitionChange = (event: ChangeEvent<HTMLInputElement>): void => {
        this.setState({transition: event.target.value});
    }

    onAddTransitionClick = (): void => {
        if (this.props.edge !== null) {
            const transitions = this.state.transitions;
            transitions.add(this.state.transition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({transition: "", transitions: transitions});
        }
    }

    onDeleteTransitionClick = (): void => {
        if (this.props.edge !== null) {
            const transitions = this.state.transitions;
            transitions.delete(this.state.transition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({transition: "", transitions: transitions});
        }
    }

    onEdgeDeleteClick = (): void => {
        if (this.props.edge !== null) {
            this.props.deleteEdge(this.props.edge.id!);
        }
    }

    render() {
        return (
            <div className="edge-control__container">
                <input
                    className="edge-control__label"
                    type="text"
                    value={transitionsToLabel(this.state.transitions)}
                    disabled
                />
                <input
                    className="edge-control__transition-input"
                    disabled={this.props.edge === null}
                    type="text"
                    value={this.state.transition}
                    onChange={this.onTransitionChange}
                />
                <button
                    className="edge-control__add-transition-button"
                    disabled={this.props.edge === null}
                    onClick={this.onAddTransitionClick}
                >
                    +
                </button>
                <button
                    className="edge-control__delete-transition-button"
                    disabled={this.props.edge === null}
                    onClick={this.onDeleteTransitionClick}
                >
                    -
                </button>
                <button
                    className="edge-control__delete-button"
                    disabled={this.props.edge === null}
                    onClick={this.onEdgeDeleteClick}
                >
                    delete
                </button>
            </div>
        );
    }
}

export default EdgeControl;