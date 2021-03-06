import React, {ChangeEvent} from "react";
import {edge} from "react-graph-vis-types";

interface EdgeControlProps {
    edge: edge | null,
    changeEdgeLabel: (id: string, label: string) => void,
    deleteEdge: (id: string) => void
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    label: string
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            label: this.props.edge?.label || ""
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {
            this.setState({label: this.props.edge?.label || "", prevEdgeId: this.props.edge?.id});
        }
    }

    onLabelChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.edge !== null) {
            this.props.changeEdgeLabel(this.props.edge.id!, event.target.value);
            this.setState({label: event.target.value});
        }
    }

    onDeleteClick = (): void => {
        if (this.props.edge !== null) {
            this.props.deleteEdge(this.props.edge.id!);
        }
    }

    render() {
        return (
            <div className="edge-control__container">
                <input
                    className="edge-control__label-input"
                    disabled={this.props.edge === null}
                    type="text"
                    value={this.state.label}
                    onChange={this.onLabelChange}
                />
                <button
                    className="edge-control__delete-button"
                    disabled={this.props.edge === null}
                    onClick={this.onDeleteClick}
                >
                    delete
                </button>
            </div>
        );
    }
}

export default EdgeControl;