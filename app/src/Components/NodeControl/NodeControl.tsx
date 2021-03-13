import React, {ChangeEvent} from "react";
import "./NodeControl.css";
import {node} from "../../react-graph-vis-types";

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
            <div className="node-control__container">
                <input
                    className="node-control__label-input"
                    disabled={this.props.node === null}
                    type="text"
                    value={this.state.label}
                    onChange={this.onLabelChange}
                />

                <input
                    className="node-control__is-admit-checkbox"
                    type="checkbox"
                    checked={this.state.isAdmit}
                    onChange={this.onIsAdmitChanged}
                />

                <input
                    className="node-control__is-initial-checkbox"
                    type="checkbox"
                    checked={this.state.isInitial}
                    onChange={this.onIsInitialChanged}
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