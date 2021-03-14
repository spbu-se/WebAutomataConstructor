import React, { ChangeEvent } from "react";
import { graph, node } from "../../react-graph-vis-types";
import {DFA} from "../../Logic/DFA";

interface runControlProps {
    elements: graph
}

interface runControlState {
    input: string,
    result: string,
    dfa: DFA | undefined
}

class RunControl extends React.Component<runControlProps, runControlState> {
    constructor(props: runControlProps) {
        super(props);

        this.state = {
            input: "",
            result: "undefined",
            dfa: undefined,
        };
    }

    componentDidMount() {
        this.initializeDFA();
    }

    componentDidUpdate(prevProps: Readonly<runControlProps>, prevState: Readonly<runControlState>, snapshot?: any) {
        if (prevProps.elements !== this.props.elements) {
            this.initializeDFA();
        }
    }

    initializeDFA = () => {
        console.warn("Reinitializing dfa");

        const initialNode = this.props.elements.nodes.find(node => node.isInitial);
        const input = this.state.input.split("");

        if (initialNode === undefined) {
            alert("There is no initial node. Please, specify one before running evaluation");
            return;
        }

        this.setState({dfa: new DFA(this.props.elements, initialNode, input)});
    }


    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        this.setState({input: event.target.value}, () => this.initializeDFA());
    }

    onStepClicked = (): void => {

    }

    onRunClicked = (): void => {
        if (this.state.dfa === undefined) {
            console.error("DFA is not initialized yet");
            return;
        }

        const result = this.state.dfa.isAdmit();

        this.setState({result: result ? "true" : "false"});
    }

    render() {
        return (
            <div className="run-control__container">
                <input
                    className="run-control__input"
                    value={this.state.input}
                    onChange={this.onInputChanged}
                />
                <button
                    className="run-control__step-button"
                    onClick={this.onStepClicked}
                >
                    Step
                </button>
                <button
                    className="run-control__run-button"
                    onClick={this.onRunClicked}
                >
                    Run
                </button>
                <span>{this.state.result}</span>
            </div>
        )
    }
}

export default RunControl;