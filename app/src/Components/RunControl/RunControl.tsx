import React, {ChangeEvent} from "react";
import {ComputerType, graph, node} from "../../react-graph-vis-types";
import {DFA} from "../../Logic/DFA";
import {isEqual} from "lodash";
import {withComputerType} from "../../hoc";
import {Computer} from "../../Logic/Computer";
import {NFA} from "../../Logic/NFA";
import ControlWrapper from "../ControlWrapper/ControlWrapper";

interface runControlProps {
    computerType: ComputerType,
    elements: graph,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void
}

interface runControlState {
    input: string,
    result?: boolean,
    computer: Computer | undefined
}

const getComputer = (computerType: ComputerType, graph: graph, initialNode: node, input: string[]): Computer => {
    switch (computerType) {
        case "dfa":
            return new DFA(graph, initialNode, input);
        case "nfa":
            return new NFA(graph, initialNode, input);
    }
}

class RunControl extends React.Component<runControlProps, runControlState> {
    constructor(props: runControlProps) {
        super(props);

        this.state = {
            input: "",
            result: undefined,
            computer: undefined
        };
    }

    componentDidMount() {
        this.initializeComputer();
    }

    componentDidUpdate(prevProps: Readonly<runControlProps>, prevState: Readonly<runControlState>, snapshot?: any) {
        if (this.ComputerShouldBeUpdated(prevProps.elements, this.props.elements)) {
            this.initializeComputer();
        }
    }

    initializeComputer = () => {
        console.warn("Reinitializing computer");

        const initialNode = this.props.elements.nodes.find(node => node.isInitial);
        const input = this.state.input.split("");

        if (initialNode === undefined) {
            console.warn("There is no initial node. Computer will not be initialized");
            return;
        }

        this.setState({
            computer: getComputer(this.props.computerType, this.props.elements, initialNode, input),
            result: undefined
        });
    }

    ComputerShouldBeUpdated = (prev: graph, current: graph): boolean => {
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

        this.state.computer?.setInput(input.split(""));

        this.setState({input: input});
    }

    onStepClicked = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        const stepResult = this.state.computer.step();

        this.props.changeStateIsCurrent(stepResult.nodes.map(node => node.id), true);
    }

    onRunClicked = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        const result = this.state.computer.run();

        this.setState({result: result.nodes.some(node => node.isAdmit)});
    }

    render() {
        return (
            <ControlWrapper title={"Run"}>
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
            </ControlWrapper>
        )
    }
}

export default withComputerType(RunControl);