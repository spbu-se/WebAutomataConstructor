import React, {ChangeEvent} from "react";
import {graph} from "../../react-graph-vis-types";
import {DFA} from "../../Logic/DFA";
import {NodeCore} from "../../Logic/IGraphTypes";
import { isEqual } from "lodash";

interface runControlProps {
    elements: graph,
    changeStateIsCurrent: (id: number, isCurrent: boolean) => void
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
            dfa: undefined
        };
    }

    componentDidMount() {
        this.initializeDFA();
    }

    componentDidUpdate(prevProps: Readonly<runControlProps>, prevState: Readonly<runControlState>, snapshot?: any) {
        if (this.DFAShouldBeUpdated(prevProps.elements, this.props.elements)) {
            this.initializeDFA();
        }
    }

    initializeDFA = () => {
        console.warn("Reinitializing dfa");

        const initialNode = this.props.elements.nodes.find(node => node.isInitial);
        const input = this.state.input.split("");

        if (initialNode === undefined) {
            console.warn("There is no initial node. DFA will not be initialized");
            return;
        }

        this.setState({
            dfa: new DFA(this.props.elements, initialNode, input),
            result: "undefined"
        });
    }

    DFAShouldBeUpdated = (prev: graph, current: graph): boolean => {
        const compareNodes = (): boolean => {
            if (prev.nodes.length !== current.nodes.length) {
                return true;
            }

            prev.nodes.forEach((prev, index) => {
                const curr = current.nodes[index];
                if (prev.id !== curr.id ||
                    prev.isAdmit !== curr.isAdmit ||
                    prev.isInitial !== curr.isInitial) {
                    return true;
                }
            });

            return false;
        }

        const compareEdges = (): boolean => {
            if (prev.edges.length !== current.edges.length) {
                return true;
            }

            prev.edges.forEach((prev, index) => {
                const curr = current.edges[index];
                if (prev.id !== curr.id ||
                    prev.from !== curr.from ||
                    prev.to !== curr.to ||
                    isEqual(prev.transitions, curr.transitions)) {
                    return true;
                }
            });

            return false;
        }

        return compareEdges() || compareNodes();
    }


    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;

        this.state.dfa?.setInput(input.split(""));

        this.setState({input: input});
    }

    onStepClicked = (): void => {
        if (this.state.dfa === undefined) {
            console.error("DFA is not initialized yet");
            return;
        }

        const stepResult = this.state.dfa.step();

        this.props.changeStateIsCurrent(stepResult.node.id, true);
    }

    onRunClicked = (): void => {
        if (this.state.dfa === undefined) {
            console.error("DFA is not initialized yet");
            return;
        }

        const result = this.state.dfa.run();

        this.setState({result: result.node.isAdmit ? "true" : "false"});
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