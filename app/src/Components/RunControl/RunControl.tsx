import React, { ChangeEvent } from "react";
import { ComputerType, graph, node } from "../../react-graph-vis-types";
import { DFA } from "../../Logic/DFA";
import { isEqual } from "lodash";
import { withComputerType } from "../../hoc";
import { Computer } from "../../Logic/Computer";
import { NFA } from "../../Logic/NFA";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import "./RunControl.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import Typography from "@mui/material/Typography";

import Tooltip from '@mui/material/Tooltip';

import { EpsilonNFA } from "../../Logic/EpsilonNFA";
import { PDA } from "../../Logic/PDA";
import { TM } from "../../Logic/TM";
import { Elements } from "../../App";
import { decorateGraph, elementsToGraph, graphToElements } from "../../utils";
import { Step } from "../../Logic/Types";
import { GraphEval } from "../../Logic/IGraphTypes";
import { Mealy } from "../../Logic/Mealy";
import { Moore } from "../../Logic/Moore";


interface runControlProps {
    computerType: ComputerType,
    elements: Elements,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void
    updMem: ((mem: string[] | undefined, ptr: number | undefined) => void)
    network: any
    setInit: ((f: () => void) => void)
    setNfaToDfa: ((f: () => void) => void)
    setMinimizeDfa: ((f: () => void) => void)
    updateElements: (elements: Elements) => void
    setComputerType: (type: null | ComputerType) => void
    setResettedStatus: (status: boolean) => void
}

interface runControlState {
    input: string,
    result?: boolean,
    computer: Computer | undefined,
    editMode: boolean,
    currentInputIndex: number,
    history: { a: node, b: string[] | undefined }[][],
    byEmptyStack: boolean,
    wasRuned: boolean,
    memory: string[] | undefined,
    gElements: graph,
    startNode: node | undefined,
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
            history: [],
            byEmptyStack: false,
            wasRuned: false,
            memory: undefined,
            gElements: elementsToGraph(this.props.elements),
            startNode: undefined
            // {nodes: [], edges: []}
        };
        // this.initializeComputer()
    }

    componentDidMount() {
        this.props.setInit(() => {
            let haveEmpty = false
            this.props.elements.edges.forEach(edge => {
                if (edge.label === "") {
                    haveEmpty = true
                }
            })
            if (!haveEmpty) {
                return this.initializeComputer
            }
        })
        this.props.setNfaToDfa(this.nfaToDfa)
        this.props.setMinimizeDfa(this.minimizeDfa)
        this.initializeComputer()
    }

    componentDidUpdate(prevProps: Readonly<runControlProps>, prevState: Readonly<runControlState>, snapshot?: any) {
        if (this.computerShouldBeUpdated(elementsToGraph(prevProps.elements), elementsToGraph(this.props.elements))) {
            this.initializeComputer();
        }
    }

    computerShouldBeUpdated = (prev: graph, current: graph): boolean => {
        const compareNodes = (): boolean => {
            if (prev.nodes.length !== current.nodes.length) {
                return true;
            }

            return prev.nodes.some((prev, index) => {
                const curr = current.nodes[index];
                return prev.id !== curr.id ||
                    prev.isAdmit !== curr.isAdmit ||
                    prev.isInitial !== curr.isInitial;
            })
        }

        const compareEdges = (): boolean => {
            if (prev.edges.length !== current.edges.length) {
                return true;
            }

            return prev.edges.some((prev, index) => {
                const curr = current.edges[index];
                return prev.id !== curr.id ||
                    prev.from !== curr.from ||
                    prev.to !== curr.to ||
                    !isEqual(curr.transitions, prev.transitions)
            });
        }

        return compareEdges() || compareNodes()
    }

    getComputer = (computerType: ComputerType, graph: graph, initialNode: node[], input: string[]): Computer | undefined => {
        switch (computerType) {
            case "dfa":
                try {
                    return new DFA(graph, initialNode, input);
                } catch (e) {
                    return undefined;
                }
            case "nfa":
                return new NFA(graph, initialNode, input);
            case "nfa-eps":
                return new EpsilonNFA(graph, initialNode, input);
            case "pda":
                return new PDA(graph, initialNode, input, this.state.byEmptyStack);
            case "tm":
                return new TM(graph, initialNode, input);
            case "mealy":
                return new Mealy(graph, initialNode, input);
            case "moore":
                return new Moore(graph, initialNode, input);
        }

    }

    initializeComputer = () => {
        console.warn("Reinitializing computer");

        this.setState({ gElements: elementsToGraph(this.props.elements) }, () => {
            const initialNode: node[] = elementsToGraph(this.props.elements).nodes.filter(node => node.isInitial);
            const input = this.state.input.split("");

            if (initialNode === undefined) {
                console.warn("There is no initial node. Computer will not be initialized");
                return;
            }

            console.log("this.state.gElementshis.state.gElementshis.state.gElements")
            console.log(this.state.gElements)

            this.setState({
                computer: this.getComputer(this.props.computerType, this.state.gElements, initialNode, input),
                result: undefined
            });

        })


    }

    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;

        this.reset();
        this.state.computer?.setInput(input.split(""));

        this.setState({ input: input });


    }

    step = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        this.props.setResettedStatus(true)


        if (this.state.wasRuned) {
            this.setState({ wasRuned: false });
            this.reset();
        }

        if (this.state.currentInputIndex === this.state.input.length - 1 && this.props.computerType !== "tm") return;
        if (this.state.result !== undefined && this.state.currentInputIndex !== -1 && this.props.computerType !== "tm") return;

        const stepResult: Step = this.state.computer.step()

        if (stepResult.nodes.length === 0) return;

        this.props.changeStateIsCurrent(stepResult.nodes.map(node => node.id), true);
        this.props.updMem(stepResult.memory, stepResult.pointer)

        let result = undefined;
        if (stepResult.counter === this.state.input.length) {
            result = stepResult.isAdmit
        } else if (this.state.currentInputIndex + 2 !== stepResult.counter) {
            result = false;
        }

        const nodes = stepResult.nodes
            .map(nodeCore => this.state.gElements.nodes.find(node => node.id == nodeCore.id))
            .filter((node): node is node => node !== undefined);

        // console.log("stepResult.nodes[i].outputstepResult.nodes[i].outputstepResult.nodes[i].output")
        // console.log(stepResult)

        const _nodes = nodes.map((e, i) => {
            const stack = stepResult.nodes[i].stack
            return {
                a: e,
                b: stack !== undefined
                    ? stack.reverse()
                    : stepResult.output !== undefined
                        ? stepResult.output!
                        : undefined
            }
        })

        if (this.props.computerType === "moore" && stepResult.counter === 1) {
            const startNode: { a: node, b: string[] | undefined }[] = [{
                a: this.state.gElements.nodes.filter(node => node.id === this.state.computer!.getCurrNode())[0],
                b: ["~"]
            }]
            console.log(startNode)
            this.setState({
                startNode: this.state.gElements.nodes.filter(node => node.id === this.state.computer!.getCurrNode())[0]
                // history: [...this.state.history, startNode],
            })
        }

        this.setState({
            result: result,
            currentInputIndex: this.state.currentInputIndex + 1,
            history: [...this.state.history, _nodes],
            memory: stepResult.memory,
            // counter: stepResult.counter
        }, () => this.historyEndRef?.current?.scrollIntoView({ behavior: 'smooth' }));


    }

    reset = (): void => {
        this.state.computer?.restart();
        this.props.changeStateIsCurrent([], true); // resets all nodes
        this.setState({
            result: undefined,
            currentInputIndex: -1,
            history: [],
            // counter: 0
        },
            // () => this.initializeComputer()
        );
        this.state.computer?.setInput(this.state.input.split(""))
        this.props.setResettedStatus(false)

        // this.initializeComputer()
    }

    run = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        this.reset();

        const result = this.state.computer.run();

        this.setState({ result: result.isAdmit, currentInputIndex: -1, history: [] });
        this.setState({ wasRuned: true })
    }

    nfaToDfa = (): void => {
        const nfaToDfa = this.state.computer!.nfaToDfa()
        const nodes = nfaToDfa.nodes.map((v, it) => ({
            id: v.id,
            isAdmit: v.isAdmit,
            label: v.id.toString(),
            isInitial: it === 0,
            isCurrent: false
        }))
        const edges = nfaToDfa.edges
        const gElements = {
            nodes: nodes,
            edges: edges
        }

        this.setState({
            gElements: gElements
        }, () => {
            this.props.updateElements(graphToElements(gElements))
            this.props.setComputerType("dfa")
        })
    }

    minimizeDfa = (): void => {
        this.initializeComputer();
        this.reset();

        const miniDFA: GraphEval = this.state.computer!.minimizeDfa()
        const nodes = miniDFA.graphcore.nodes.map((v) => ({
            id: v.id,
            isAdmit: v.isAdmit,
            label: 'G' + v.id.toString(),
            isInitial: v.id === miniDFA.start.id,
            isCurrent: false
        }))
        const edges = miniDFA.graphcore.edges
        const gElements = {
            nodes: nodes,
            edges: edges
        }

        this.setState({
            gElements: gElements
        }, () => {
            this.props.updateElements(graphToElements(gElements))
        })
    }

    render() {
        return (
            <ControlWrapper title={"Запуск"}>
                <div>

                    <div className="run-control__item run-control__input__row">
                        {
                            this.state.editMode
                                ?
                                <TextField
                                    label="Входная строка"
                                    size="small"
                                    value={this.state.input}
                                    onChange={this.onInputChanged}
                                    onBlur={() => {
                                        this.state.input.length && this.setState({ editMode: false }, () => this.initializeComputer())
                                    }}
                                />
                                :
                                <div
                                    className="run-control__input-value"
                                    onClick={() => {
                                        this.setState({ editMode: true });
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
                                        ? <DoneIcon style={{ color: "var(--commerce)" }} />
                                        : <CloseIcon style={{ color: "var(--destructive)" }} />
                            }
                        </div>

                    </div>

                    <div className="run-control__item run-control__buttons">
                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                onClick={this.step}
                            >
                                Шаг
                            </Button>
                        </div>

                        {
                            this.props.computerType !== "tm"
                                ?
                                <div className="run-control__button">
                                    <Button
                                        variant="outlined"
                                        onClick={this.run}
                                    >
                                        Запуск
                                    </Button>
                                </div>
                                : <></>
                        }

                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                onClick={this.reset}
                            >
                                Сбросить
                            </Button>
                        </div>

                        {/*{*/}
                        {/*    this.props.computerType === "dfa" ?*/}
                        {/*        <div className="run-control__button">*/}
                        {/*            <Button*/}
                        {/*                variant="outlined"*/}
                        {/*                onClick={this.minimizeDfa}*/}
                        {/*            >*/}
                        {/*                minimize*/}
                        {/*            </Button>*/}
                        {/*        </div>*/}
                        {/*        : <></>*/}
                        {/*}*/}


                    </div>

                    {/* {
                        this.props.computerType === "pda"
                            ?
                            <div className="run-control__button">
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    // onClick={this.run}

                                    onClick={() => {
                                        const curStbyEmp = this.state.byEmptyStack;
                                        this.setState({ byEmptyStack: !curStbyEmp });
                                        this.state.computer!.byEmptyStackAdmt(!curStbyEmp)
                                        this.reset();
                                    }}
                                >
                                    {this.state.byEmptyStack ? "По стеку" : "По состоянию"}
                                </Button>
                            </div>
                            : <div />
                    } */}

                    <div className="run-control__item run-control__history">
                        <div className="run-control__history__header">
                            <Typography variant="h6">История</Typography>
                        </div>
                        {
                            this.state.history.length !== 0 ?
                                <div className="run-control__history__scroll">


                                    {
                                        this.state.startNode !== undefined 
                                        ? 
                                            <div className="run-control__history__row" key={0}>
                                                <span className="run-control__history__index">{0}</span>
                                                {
                                                    <Tooltip
                                                        title={<Typography className="display-linebreak">{"~"}</Typography>}>
                                                        <div
                                                            className="run-control__history__node"
                                                            style={{ border: `${this.state.startNode!.isInitial ? "var(--accent)" : this.state.startNode!.isAdmit ? "var(--second-accent)" : "#000000"} 2px solid` }}
                                                        >
                                                            {this.state.startNode!.label}
                                                        </div>
                                                    </Tooltip>
                                                }
                                            </div>
                                        : <div/>
                                    }

                                    {
                                        this.state.history.map((nodes, index) => (
                                            <div className="run-control__history__row" key={index}>
                                                <span className="run-control__history__index">{index + 1}</span>
                                                {
                                                    nodes.map((node, index) => (
                                                        <Tooltip
                                                            title={<Typography className="display-linebreak">{node.b !== undefined ? node.b.join('\n') : ''}</Typography>}>
                                                            <div
                                                                className="run-control__history__node"
                                                                style={{ border: `${node.a.isInitial ? "var(--accent)" : node.a.isAdmit ? "var(--second-accent)" : "#000000"} 2px solid` }}
                                                            >
                                                                {node.a.label}
                                                            </div>
                                                        </Tooltip>
                                                    ))
                                                }
                                            </div>
                                        ))
                                    }
                                    <div ref={this.historyEndRef} />
                                </div>
                                :
                                <div className="run-control__history__placeholder">
                                    Используйте пошаговый запуск, чтобы наблюдать за историей
                                </div>
                        }
                    </div>

                </div>
            </ControlWrapper>
        )
    }
}

export default withComputerType(RunControl);