import React, {ChangeEvent} from "react";
import {ComputerType, graph, node} from "../../react-graph-vis-types";
import {DFA} from "../../Logic/DFA";
import {isEqual} from "lodash";
import {withComputerType} from "../../hoc";
import {Computer} from "../../Logic/Computer";
import {NFA} from "../../Logic/NFA";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import "./RunControl.css";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import {NodeCore} from "../../Logic/IGraphTypes";
import Typography from "@material-ui/core/Typography";

interface runControlProps {
    computerType: ComputerType,
    elements: graph,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void
}

interface runControlState {
    input: string,
    result?: boolean,
    computer: Computer | undefined,
    editMode: boolean,
    currentInputIndex: number,
    history: node[][]
}

const getComputer = (computerType: ComputerType, graph: graph, initialNode: node, input: string[]): Computer => {
    switch (computerType) {
        case "dfa":
            return new DFA(graph, [initialNode], input);
        case "nfa":
            return new NFA(graph, [initialNode], input);
    }
}

class RunControl extends React.Component<runControlProps, runControlState> {

    historyEndRef = React.createRef<HTMLDivElement>();

    constructor(props: runControlProps) {
        super(props);

        this.state = {
            input: "",
            result: undefined,
            computer: undefined,
            editMode: true,
            currentInputIndex: -1,
            history: []
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

        this.reset();
        this.state.computer?.setInput(input.split(""));

        this.setState({input: input});
    }

    step = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        if (this.state.currentInputIndex === this.state.input.length - 1) return;

        const stepResult = this.state.computer.step();

        this.props.changeStateIsCurrent(stepResult.nodes.map(node => node.id), true);

        const result = this.state.currentInputIndex + 1 === this.state.input.length - 1
            ? stepResult.nodes.some(node => node.isAdmit)
            : undefined;

        const nodes = stepResult.nodes
            .map(nodeCore => this.props.elements.nodes.find(node => node.id == nodeCore.id))
            .filter((node): node is node => node !== undefined);

        this.setState({
            result: result,
            currentInputIndex: this.state.currentInputIndex + 1,
            history: [...this.state.history, nodes]
        }, () => this.historyEndRef?.current?.scrollIntoView({behavior: 'smooth'}));
    }

    run = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        const result = this.state.computer.run();

        this.setState({result: result.nodes.some(node => node.isAdmit)});
    }

    reset = (): void => {
        this.state.computer?.restart();
        this.props.changeStateIsCurrent([], true); // resets all nodes
        this.setState({result: undefined, currentInputIndex: -1, history: []});
    }


    render() {
        return (
            <ControlWrapper title={"Run"}>
                <div>

                    <div className="run-control__item run-control__input__row">
                        {
                            this.state.editMode ?
                                <TextField
                                    label="Computer input"
                                    value={this.state.input}
                                    onChange={this.onInputChanged}
                                    onBlur={() => {
                                        this.state.input.length && this.setState({editMode: false})
                                    }}
                                />
                                :
                                <div
                                    className="run-control__input-value"
                                    onClick={() => {
                                        this.setState({editMode: true});
                                    }}
                                >
                                    {
                                        Array.from(this.state.input).map((char, index) => (
                                            <span
                                                className={"run-control__input__span" + (this.state.currentInputIndex === index ? "--current" : "")}
                                                key={index}
                                            >
                                                {char}
                                            </span>
                                        ))
                                    }
                                </div>
                        }

                        <div className="run-control__result">
                            {
                                this.state.result === undefined ? null :
                                    this.state.result
                                        ? <DoneIcon style={{color: "var(--commerce)"}}/>
                                        : <CloseIcon style={{color: "var(--destructive)"}}/>
                            }
                        </div>

                    </div>

                    <div className="run-control__item run-control__buttons">
                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={this.step}
                            >
                                Шаг
                            </Button>
                        </div>

                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={this.run}
                            >
                                Запуск
                            </Button>
                        </div>

                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={this.reset}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </div>

                    <div className="run-control__item run-control__history">
                        <div className="run-control__history__header">
                            <Typography variant="h6">История</Typography>
                        </div>
                        {
                            this.state.history.length !== 0 ?
                                <div className="run-control__history__scroll">
                                    {
                                        this.state.history.map((nodes, index) => (
                                            <div className="run-control__history__row" key={index}>
                                                <span className="run-control__history__index">{index + 1}</span>
                                                {
                                                    nodes.map((node, index) => (
                                                        <div
                                                            className="run-control__history__node"
                                                            style={{border: `${node.isInitial ? "var(--accent)" : node.isAdmit ? "var(--second-accent)" : "#000000"} 2px solid`}}
                                                        >
                                                            {node.label}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        ))
                                    }
                                    <div ref={this.historyEndRef}/>
                                </div>
                                :
                                <div className="run-control__history__placeholder">
                                    Run computer step by step to see the history
                                </div>
                        }
                    </div>

                </div>
            </ControlWrapper>
        )
    }
}

export default withComputerType(RunControl);