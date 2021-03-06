import React, {ChangeEvent} from "react";
import "./NodeControl.css";
import {node} from "react-graph-vis-types";

interface nodeControlProps {
    node: node | null,
    changeNodeLabel: (id: number, label: string) => void,
    deleteNode: (id: number) => void,
}

interface nodeControlState {
    prevNodeId: number | undefined,
    label: string
}

class NodeControl extends React.Component<nodeControlProps, nodeControlState> {
    constructor(props: nodeControlProps) {
        super(props);

        this.state = {
            prevNodeId: this.props.node?.id,
            label: this.props.node?.label || ""
        }
    }

    componentDidUpdate(prevProps: Readonly<nodeControlProps>, prevState: Readonly<nodeControlState>) {
        if (this.props.node?.id !== prevState.prevNodeId) {
            this.setState({label: this.props.node?.label || "", prevNodeId: this.props.node?.id});
        }
    }

    onLabelChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.node !== null) {
            this.props.changeNodeLabel(this.props.node.id, event.target.value);
            this.setState({label: event.target.value});
        }
    }

    onDeleteClick = (): void => {
        if (this.props.node !== null) {
            this.props.deleteNode(this.props.node.id);
        }
    }

    render() {
        return (
            <div className="node-control__container">
                <input
                    className="node-control__label-input"
                    disabled={this.props.node === null}
                    type="text"
                    value={this.state.label}
                    onChange={this.onLabelChange}
                />

                <button
                    className={"node-control__delete-button"}
                    disabled={this.props.node === null}
                    onClick={this.onDeleteClick}
                >
                    delete
                </button>
            </div>
        )
    }
}

export default NodeControl;