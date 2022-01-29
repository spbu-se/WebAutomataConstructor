import React, {ChangeEvent} from "react";
import {ComputerType, graph, node} from "../../react-graph-vis-types";
import {DFA} from "../../Logic/DFA";
import {isEqual} from "lodash";
import {withComputerType} from "../../hoc";
import {Computer} from "../../Logic/Computer";
import {NFA} from "../../Logic/NFA";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import "./RunControl.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import Typography from "@mui/material/Typography";

import Tooltip from '@mui/material/Tooltip';

import {EpsilonNFA} from "../../Logic/EpsilonNFA";
import {PDA} from "../../Logic/PDA";
import { TM } from "../../Logic/TM";
import { Elements } from "../../App";
import {decorateGraph, elementsToGraph, graphToElements } from "../../utils";
import { Step } from "../../Logic/Types";


interface runControlProps {
    computerType: ComputerType,
    elements: Elements,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void
    updMem: ((mem: string[] | undefined, ptr: number | undefined) => void)
    network: any
    getInit: ((f: () => void) => void)
    getNfaToDfa: ((f: () => void) => void)
    updateElements: (elements: Elements) => void
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
        };
        this.initializeComputer()
    }

    componentDidMount() {
        this.props.getInit(this.initializeComputer)
        this.props.getNfaToDfa(this.nfaToDfa)
        this.initializeComputer()
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        //Не более чем для проверки - был ли создан default-graph для <computer-type>.
        if (this.props.elements.nodes.length > prevProps.elements.nodes.length) {
            this.setState({gElements: elementsToGraph(this.props.elements)}, () => this.initializeComputer())
        }
    }

        getComputer = (computerType: ComputerType, graph: graph, initialNode: node, input: string[]): Computer | undefined => {
        switch (computerType) {
            case "dfa":
                try {
                    return new DFA(graph, [initialNode], input);
                } catch (e) {
                    return undefined;
                }
            case "nfa":
                return new NFA(graph, [initialNode], input);
            case "nfa-eps":
                return new EpsilonNFA(graph, [initialNode], input);
            case "pda":
                return new PDA(graph, [initialNode], input, this.state.byEmptyStack);
            case "tm":
                return new TM(graph, [initialNode], input);

        }

    }

    initializeComputer = () => {
        console.warn("Reinitializing computer");

        this.setState({gElements: elementsToGraph(this.props.elements)})

        const initialNode = elementsToGraph(this.props.elements).nodes.find(node => node.isInitial);
        const input = this.state.input.split("");



        if (initialNode === undefined) {
            console.warn("There is no initial node. Computer will not be initialized");
            return;
        }

        this.setState({
            computer: this.getComputer(this.props.computerType, this.state.gElements, initialNode, input),
            result: undefined
        });
    }

    initializeComputerK = () => (k: (() => void) | undefined) =>  {
        console.warn("Reinitializing computer");

        this.setState({gElements: elementsToGraph(this.props.elements)})

        const initialNode = this.state.gElements.nodes.find(node => node.isInitial);
        const input = this.state.input.split("");

        if (initialNode === undefined) {
            console.warn("There is no initial node. Computer will not be initialized");
            return;
        }

        this.setState({
            computer: this.getComputer(this.props.computerType, this.state.gElements, initialNode, input),
            result: undefined
        }, k);
    }

    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;

        this.reset();
        this.state.computer?.setInput(input.split(""));

        this.setState({input: input}, () => this.initializeComputer());


    }

    step = (): void => {
        // if (this.state.counter === 0) {
        //     this.initializeComputer()
        // }

        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        if (this.state.wasRuned) {
            this.setState({ wasRuned: false});
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
            // result = stepResult.nodes.some(node => node.isAdmit);
        } else if (this.state.currentInputIndex + 2 !== stepResult.counter) {
            result = false;
        }

        const nodes = stepResult.nodes
            .map(nodeCore => this.state.gElements.nodes.find(node => node.id == nodeCore.id))
            .filter((node): node is node => node !== undefined);

        const _nodes = nodes.map((e, i) => {
            return { a: e, b: stepResult.nodes[i].stack }
        })

        this.setState({
            result: result,
            currentInputIndex: this.state.currentInputIndex + 1,
            history: [...this.state.history, _nodes],
            memory: stepResult.memory,
            // counter: stepResult.counter
        }, () => this.historyEndRef?.current?.scrollIntoView({behavior: 'smooth'}));


    }



    reset = (): void => {
        this.state.computer?.restart();
        this.props.changeStateIsCurrent([], true); // resets all nodes
        this.setState({
                result: undefined,
                currentInputIndex: -1,
                history: [],
                // counter: 0
            }, () => this.initializeComputer());
        this.state.computer?.setInput(this.state.input.split(""))
        this.initializeComputer()
    }

    run = (): void => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        this.reset();

        const result = this.state.computer.run();

        this.setState({result: result.isAdmit, currentInputIndex: -1, history: []});
        this.setState({ wasRuned: true })
    }

    nfaToDfa = (): void => {


        const input = this.state.input.split("");
        const nfaToDfa = this.state.computer!.nfaToDfa()
        const nodes = nfaToDfa.nodes.map((v, it) => ({
            id: v.id,
            isAdmit: v.isAdmit,
            label: v.id.toString(),
            isInitial: it === 0,
            isCurrent: false
        }))
        const gElements = {
            nodes: nodes,
            edges: nfaToDfa.edges
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
                            this.state.editMode ?
                                <TextField
                                    label="Входная строка"
                                    size="small"
                                    value={this.state.input}
                                    onChange={this.onInputChanged}
                                    onBlur={() => {
                                        this.state.input.length && this.setState({editMode: false}, () => this.initializeComputer())
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
                                onClick={this.step}
                            >
                                Шаг
                            </Button>
                        </div>

                        {
                            this.props.computerType !== "tm" ?
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

                        {
                            this.props.computerType === "nfa" || this.props.computerType === "nfa-eps" ?
                                <div className="run-control__button">
                                    <Button
                                        variant="outlined"
                                        onClick={this.nfaToDfa}
                                    >
                                        nfaToDfa
                                    </Button>
                                </div>
                                : <></>
                        }


                    </div>

                    {
                        this.props.computerType === "pda" ?
                            <div className="run-control__button">
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    // onClick={this.run}

                                    onClick={() => {
                                        const curStbyEmp = this.state.byEmptyStack;
                                        this.setState({ byEmptyStack: !curStbyEmp});
                                        this.state.computer!.byEmptyStackAdmt(!curStbyEmp)
                                        this.reset();
                                    }}
                                >
                                    {this.state.byEmptyStack ?  "По стеку" : "По состоянию"}
                                </Button>
                            </div> : <div/>
                    }

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
                                                        <Tooltip
                                                            title={ <Typography className="display-linebreak">{node.b !== undefined ? node.b.reverse().join('\n') : ''}</Typography> }>
                                                            <div
                                                                className="run-control__history__node"
                                                                style={{border: `${node.a.isInitial ? "var(--accent)" : node.a.isAdmit ? "var(--second-accent)" : "#000000"} 2px solid`}}
                                                            >
                                                                {node.a.label}
                                                            </div>
                                                        </Tooltip>
                                                    ))
                                                }
                                            </div>
                                        ))
                                    }
                                    <div ref={this.historyEndRef}/>
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