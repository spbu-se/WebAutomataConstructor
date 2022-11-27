import React, { ChangeEvent } from "react";
import { ComputerType, graph, histNode, node } from "../../react-graph-vis-types";
import { DFA } from "../../Logic/DFA";
import { isEqual } from "lodash";
import { withComputerType } from "../../hoc";
import { Computer, EPS } from "../../Logic/Computer";
import { NFA } from "../../Logic/NFA";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import "./RunControl.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import {PetriNets} from "../../Logic/PetriNets";
import { EpsilonNFA } from "../../Logic/EpsilonNFA";
import { PDA } from "../../Logic/PDA";
import { TM } from "../../Logic/TM";
import { Elements } from "../../App";
import { decorateGraph, elementsToGraph, graphToElements } from "../../utils";
import { HistUnit, Output, Step } from "../../Logic/Types";
import { GraphEval, GraphEvalMultiStart, Move, NodeCore } from "../../Logic/IGraphTypes";
import { Mealy } from "../../Logic/Mealy";
import { Moore } from "../../Logic/Moore";
import { start } from "repl";
import { ContactSupportOutlined } from "@mui/icons-material";
import { NonDeterministic, NonMinimizable } from "../../Logic/Exceptions";
import { DPDA } from "../../Logic/DPDA";
import { DMealy } from "../../Logic/DMealy";
import { DMoore } from "../../Logic/DMoore";
import { isAbsolute } from "path";
import { History } from "./History"

interface runControlProps {
    computerType: ComputerType,
    elements: Elements,
    treeElems: Elements,
    historyEndRef: React.RefObject<HTMLDivElement>,
    byEmptyStack: boolean,
    changerStack: () => void,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void
    updMem: (mem: string[] | undefined, ptr: number | undefined) => void
    network: any
    createHistNode: (idd: number, label: string, isAdmit: boolean, isInitial: boolean, isCurrent: boolean) => void
    createHistEdge: (from: number, to: number, by: any) => void
    getLastHistNodeId: () => number
    resetHistTree: () => void
    setInit: (f: () => void) => void
    setNfaToDfa: (f: () => void) => void
    setMinimizeDfa: (f: () => void) => void
    setMooreToMealy: (f: () => void) => void
    setMealyToMoore: (f: () => void) => void
    setChangerByStack: (f: () => void) => void
    setRun: (f: () => void) => void
    setStep: (f: () => void) => void
    setReset: (f: () => void) => void
    setHistory: (jsx: () => JSX.Element) => void
    updateElements: (elements: Elements) => void
    setComputerType: (type: null | ComputerType) => void
    setResettedStatus: (status: boolean) => void
    setByEmptyStack: (byEmptyStack: boolean) => void
    setIsNonDetermenistic: (v: boolean) => void
    setIsNonMinimizable: (v: boolean) => void
    treeContextInfo: () => string
    treeVisible: () => boolean
}

interface runControlState {
    input: string,
    result?: boolean,
    computer: Computer | undefined,
    editMode: boolean,
    currentInputIndex: number,
    history: { node: node, note: string[] | undefined }[][],
    byEmptyStack: boolean,
    wasRuned: boolean,
    memory: string[] | undefined,
    gElements: graph,
    startNode: node | undefined,
    lastHistUnits: nodeTree[],
    startStatements: NodeCore[]
}

type ButtonSource = { name: () => string, onClick: () => void }

const creatButtons = (buttons: ButtonSource[][]) => {
    const buttonsComp = buttons.reduce((acc: any[], buttons) => {
        acc.push(
            <div className="run-control__item run-control__buttons">
                {
                    buttons.map((button) =>
                        <div className="run-control__button">
                            <Button
                                variant="outlined"
                                onClick={
                                    () => { button.onClick() }
                                }
                            >
                                {button.name()}
                            </Button>
                        </div>
                    )

                }
            </div>
        )

        return acc
    }, [])
    return (
        <div>
            {buttonsComp}
        </div>
    )
}

type nodeTree = {
    id: number,
    idd: number,
    stack?: string[],
    move?: Move,
    by?: string,
    from?: NodeCore,
    stackDown?: string,
    output?: Output,
    label: string,
    isAdmit: boolean,
    isInitial: boolean,
    isCurrent: boolean
}

class RunControl extends React.Component<runControlProps, runControlState> {

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
            startNode: undefined,
            lastHistUnits: [],
            startStatements: []
        };
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
                return this.initializeComputer()
            }
        })
        this.props.setNfaToDfa(this.nfaToDfa)
        this.props.setMinimizeDfa(this.minimizeDfa)
        this.props.setMooreToMealy(this.mooreToMealy)
        this.props.setMealyToMoore(this.mealyToMoore)
        this.props.setChangerByStack(this.admitByStack)
        this.props.setRun(this.run)
        this.props.setStep(this.step)
        this.props.setReset(this.reset)
        this.props.setHistory(() =>
            <History
                startNode={this.state.startNode!}
                history={this.state.history!}
                historyEndRef={this.props.historyEndRef}
            />)
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
            case "dpda":
                return new DPDA(graph, initialNode, input, this.state.byEmptyStack);
            case "tm":
                return new TM(graph, initialNode, input);
            case "mealy":
                return new Mealy(graph, initialNode, input);
            case "dmealy":
                return new DMealy(graph, initialNode, input);
            case "moore":
                return new Moore(graph, initialNode, input);
            case "dmoore":
                return new DMoore(graph, initialNode, input);
            case "petriNets":
                return new PetriNets(graph, initialNode, input);
        }

    }

    initializeComputer = () => {
        console.warn("Reinitializing computer");

        this.setState({ gElements: elementsToGraph(this.props.elements) }, () => {
            this.props.resetHistTree()

            const initialNode: node[] = elementsToGraph(this.props.elements).nodes.filter(node => node.isInitial);
            const input = this.state.input.split("");

            if (initialNode === undefined) {
                console.warn("There is no initial node. Computer will not be initialized");
                return;
            }

            this.setState({
                computer: this.getComputer(this.props.computerType, this.state.gElements, initialNode, input),
                result: undefined
            }, async () => {

                const tmp: nodeTree[] = []

                const startStmts = this.state.computer !== undefined
                    ? this.state.computer.getStartStatements()
                    : []

                startStmts.forEach((v, index) => {
                    const paddingTreeId = index + 1

                    tmp.push({
                        stack: v.stack ? [...v.stack] : [],
                        from: v.from!,
                        by: v.by,
                        stackDown: v.stackDown,
                        label: `${v.id}`,
                        isAdmit: v.isAdmit,
                        isInitial: true,
                        isCurrent: false,
                        id: this.props.getLastHistNodeId() + paddingTreeId,
                        idd: v.id
                    })
                })

                if (this.props.computerType === 'pda' || this.props.computerType === 'dpda') {
                    tmp.forEach((v) => {
                        const gNode = this.state.gElements.nodes.find((gEl) => gEl.id === v.idd)
                        const label = gNode?.label + '\n―' + (v.stack!.reduce((acc, stack) => '\n' + stack + acc, ''))
                        // + '\n' + `${(this.props.getLastHistNodeId() + 1)}` + 
                        this.props.createHistNode(v.idd, label, v.isAdmit, v.isInitial, v.isCurrent)
                    })
                } else {
                    tmp.forEach((v) => {
                        const gNode = this.state.gElements.nodes.find((gEl) => gEl.id === v.idd)
                        this.props.createHistNode(v.idd, gNode!.label, v.isAdmit, v.isInitial, v.isCurrent)
                    })
                }
                await this.setState({ lastHistUnits: tmp })
            });

        })

    }

    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;

        this.reset();
        this.state.computer?.setInput(input.split(""));

        this.setState({ input: input });
    }



    drawTreeLayot = (nodes: NodeCore[], pred: nodeTree[], tmp: nodeTree[]) => {
        nodes.forEach((v, index) => {
            const paddingTreeId = index + 1
            const gNode = this.state.gElements.nodes.find((gEl) => gEl.id === v.id)

            tmp.push({
                stack: v.stack ? [...v.stack] : [],
                from: v.from!,
                by: v.by,
                stackDown: v.stackDown,
                move: v.move,
                output: v.output,
                label: `${v.id}`,
                isAdmit: v.isAdmit,
                isInitial: gNode!.isInitial,
                isCurrent: gNode!.isCurrent,
                id: this.props.getLastHistNodeId() + paddingTreeId,
                idd: v.id
            })
        })

        if (this.props.computerType === 'pda' || this.props.computerType === 'dpda') {
            tmp.forEach((v) => {
                const gNode = this.state.gElements.nodes.find((gEl) => gEl.id === v.idd)
                const label = gNode?.label + '\n' + '―' + (v.stack!.reduce((acc, stack) => '\n' + stack + acc, ''))
                this.props.createHistNode(v.idd, label, v.isAdmit, v.isInitial, v.isCurrent)
            })
        } else {
            tmp.forEach((v) => {
                const gNode = this.state.gElements.nodes.find((gEl) => gEl.id === v.idd)
                this.props.createHistNode(v.idd, gNode!.label, v.isAdmit, v.isInitial, v.isCurrent)
            })
        }


        const letter = (l: any) => l === EPS ? 'ε' : l

        const stackDwn = (stDwn: any) => this.props.computerType === 'pda' || this.props.computerType === 'dpda'
            ? ', ' + letter(stDwn)
            : ''

        const move = (mv: Move | undefined) => this.props.computerType === 'tm'
            ? mv === Move.L ? ', L' : ", R"
            : ''

        const output = (out: any) => this.props.computerType === 'mealy' || this.props.computerType === 'dmealy'
            ? ', ' + out
            : ''

        const txt = (l: any, stDwn: any, mv: any, out: any) => letter(l) + stackDwn(stDwn) + move(mv) + output(out)

        const bySymbRules = tmp.reduce((acc: { from: number, to: number[], by: any }[], v) => {
            const from = () => {
                switch (this.props.computerType) {
                    case 'tm':
                    case 'moore':
                    case 'dmoore':
                    case 'mealy':
                    case 'dmealy':
                        return pred.filter((p) => v.from && p.idd === v.from?.id)[0].id;
                    default:
                        return pred.filter((p) => v.from && p.idd === v.from?.id && p.stack?.toString === v.from.stack?.toString)[0].id
                }
            }
            acc.push({ from: from(), to: [v.id], by: txt(v.by, v.stackDown, v.move, v.output) })
            return acc
        }, [])

        console.log('\n\n\n')

        bySymbRules.forEach((rule) => rule.to.forEach((to) => this.props.createHistEdge(rule.from, to, rule.by)))

        this.setState({ lastHistUnits: tmp })

    }

    treeEps = (byEpsPred: NodeCore[], byLetter: NodeCore[], byEpsAfter: NodeCore[]) => {
        console.log('\n')
        console.log('EPS>>>', byEpsPred)
        console.log('LTR>>>', byLetter)
        console.log('EPS>>>', byEpsAfter)
        console.log('\n')

        const tmp: nodeTree[] = []
        this.drawTreeLayot(byEpsPred, this.state.lastHistUnits, tmp)
        const tmp1: nodeTree[] = []
        this.drawTreeLayot(byLetter, tmp, tmp1)
        const tmp2: nodeTree[] = []
        this.drawTreeLayot(byEpsAfter, tmp1, tmp2)
    }

    tree = (byLetter: NodeCore[]) => {
        const tmp: nodeTree[] = []
        this.drawTreeLayot(byLetter, this.state.lastHistUnits, tmp)
    }

    step = async () => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        this.props.setResettedStatus(true)


        if (this.state.wasRuned) {
            this.setState({ wasRuned: false });
            this.reset();
            await this.props.resetHistTree()
        }

        if (this.state.currentInputIndex === this.state.input.length - 1 && this.props.computerType !== "tm") return;
        if (this.state.result !== undefined && this.state.currentInputIndex !== -1 && this.props.computerType !== "tm") return;

        try {
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
                .map(nodeCore => this.state.gElements.nodes.find(node => node.id === nodeCore.id))
                .filter((node): node is node => node !== undefined);

            const byEpsPred = stepResult.byEpsPred ? stepResult.byEpsPred : []

            const byLetter = stepResult.byLetter ? stepResult.byLetter : []

            const byEpsAfter = stepResult.byEpsAfter ? stepResult.byEpsAfter : []

            if (this.props.computerType !== 'tm' && this.state.computer.haveEpsilon()) {
                console.log('byEpsAfter>>>', byEpsAfter)
                this.treeEps(byEpsPred, byLetter, byEpsAfter)
            } else {
                console.log('byLetter', byLetter)
                const tmp: nodeTree[] = []
                this.drawTreeLayot(byLetter, this.state.lastHistUnits, tmp)
            }

            const _nodes = nodes.map((e, i) => {
                const stack = stepResult.nodes[i].stack
                return {
                    node: e,
                    note: stack !== undefined
                        ? stack.reverse()
                        : stepResult.output !== undefined
                            ? stepResult.output!
                            : undefined
                }
            })

            this.setState({
                result: result,
                currentInputIndex: this.state.currentInputIndex + 1,
                history: [...this.state.history, _nodes],
                memory: stepResult.memory,
            }, () => {
                this.props.setHistory(() =>
                    <History
                        startNode={this.state.startNode!}
                        history={this.state.history!}
                        historyEndRef={this.props.historyEndRef}
                    />)
            });

        } catch (e) {
            if (e instanceof NonDeterministic) {
                this.props.setIsNonDetermenistic(true)
                console.log('NonDeterministic')
            }
            else {
                console.log(e)
            }
        }

    }

    reset = (): void => {
        this.state.computer?.restart();
        this.props.changeStateIsCurrent([], true);
        this.setState({
            result: undefined,
            currentInputIndex: -1,
            history: [],
        },
            () => {
                this.initializeComputer()
                this.props.setHistory(() =>
                    <History
                        startNode={this.state.startNode!}
                        history={this.state.history!}
                        historyEndRef={this.props.historyEndRef}
                    />)
            }
        );
        this.state.computer?.setInput(this.state.input.split(""))
        this.props.setResettedStatus(false)
        this.props.resetHistTree()
    }

    run = async (): Promise<void> => {
        if (this.state.computer === undefined) {
            console.error("Computer is not initialized yet");
            return;
        }

        await this.reset();

        try {
            const result = this.state.computer.run();

            const histTrace = result.histTrace ? result.histTrace : []

            histTrace.forEach(async (histStep) => {
                const byEpsPred = histStep.byEpsPred ? histStep.byEpsPred : []

                const byLetter = histStep.byLetter ? histStep.byLetter : []

                const byEpsAfter = histStep.byEpsAfter ? histStep.byEpsAfter : []

                if (this.state.computer && this.state.computer.haveEpsilon()) {
                    this.treeEps(byEpsPred, byLetter, byEpsAfter)
                } else {
                    this.tree(byLetter)
                }
            })

            this.setState({ result: result.isAdmit, currentInputIndex: -1, history: [] });
            this.setState({ wasRuned: true })
        } catch (e) {
            if (e instanceof NonDeterministic) {
                this.props.setIsNonDetermenistic(true)
                console.log('NonDeterministic')
            }
        }
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

    admitByStack = (): void => {
        const curStbyEmp = this.state.byEmptyStack;
        this.setState({ byEmptyStack: !curStbyEmp });
        this.props.setByEmptyStack(!curStbyEmp)
        this.state.computer!.byEmptyStackAdmt(!curStbyEmp)
        this.reset();
    }

    minimizeDfa = (): void => {
        this.initializeComputer();
        this.reset();

        try {
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
        } catch (e) {
            if (e instanceof NonMinimizable) {
                this.props.setIsNonMinimizable(true)
                console.log('NonDeterministic')
            }
        }
    }

    mooreToMealy = (): void => {
        this.initializeComputer();
        this.reset();

        const mealy: GraphEvalMultiStart = this.state.computer!.mooreToMealy()

        const starts = mealy.start.map((v) => v.id)

        const nodes = mealy.graphcore.nodes.map((v) => ({
            id: v.id,
            isAdmit: v.isAdmit,
            label: 'S' + v.id.toString(),
            isInitial: starts.includes(v.id),
            isCurrent: false,
        }))
        const edges = mealy.graphcore.edges
        const gElements = {
            nodes: nodes,
            edges: edges
        }
        this.setState({
            gElements: gElements
        }, () => {
            this.props.updateElements(graphToElements(gElements))
            this.props.setComputerType("mealy")
        })
    }

    mealyToMoore = (): void => {
        this.initializeComputer();
        this.reset();

        const miniDFA: GraphEvalMultiStart = this.state.computer!.mealyToMoore()

        const starts = miniDFA.start.map(v => v.id)

        const nodes = miniDFA.graphcore.nodes.map((v) => ({
            id: v.id,
            isAdmit: v.isAdmit,
            label: 'S' + v.id.toString() + ' | ' + v.output,
            isInitial: starts.includes(v.id),
            isCurrent: false,
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
            this.props.setComputerType("moore")
        })
    }

    private defaultButtonsLine: ButtonSource[] = [
        { name: () => 'Шаг', onClick: () => this.step() },
        { name: () => 'Запуск', onClick: () => this.run() },
        { name: () => 'Сбросить', onClick: () => this.reset() },
    ]

    private defaultButtons: ButtonSource[][] = [this.defaultButtonsLine]

    private buttonsTree: ButtonSource[][] = [
        this.defaultButtonsLine,
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }]
    ]

    private buttonNfa: ButtonSource[][] = [
        this.defaultButtonsLine,
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }],
        [{ name: () => 'ДКА', onClick: () => this.nfaToDfa() }],
    ]


    private buttonDfa: ButtonSource[][] = [
        this.defaultButtonsLine,
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }],
        [{ name: () => 'Минимизировать', onClick: () => this.minimizeDfa() }],
    ]


    private buttonMealy: ButtonSource[][] = [
        this.defaultButtonsLine,
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }],
        [{ name: () => 'Мур', onClick: () => this.mealyToMoore() }],
    ]

    private buttonMoore: ButtonSource[][] = [
        this.defaultButtonsLine,
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }],
        [{ name: () => 'Мили', onClick: () => this.mooreToMealy() }],
    ]

    private buttonsByStackByState: ButtonSource[][] = [
        this.defaultButtonsLine,
        [
            { name: () => this.props.byEmptyStack ? "По стеку" : "По состоянию", onClick: () => this.props.changerStack() },
            { name: this.props.treeContextInfo, onClick: this.props.treeVisible }
        ],
    ]

    private buttonsNoRun: ButtonSource[][] = [
        [
            { name: () => 'Шаг', onClick: () => this.step() },
            { name: () => 'Сбросить', onClick: () => this.reset() }
        ],
        [{ name: this.props.treeContextInfo, onClick: this.props.treeVisible }]
    ]

    private getButtons = () => {
        switch (this.props.computerType) {
            case "dfa":
                return creatButtons(this.buttonDfa)
            case "nfa": 
            case "nfa-eps":
                return creatButtons(this.buttonNfa)
            case "tm":
                return creatButtons(this.buttonsNoRun)
            case "pda":
            case "dpda":
                return creatButtons(this.buttonsByStackByState)
            case "mealy":
            case "dmealy": 
                return creatButtons(this.buttonMealy)
            case "moore":
            case "dmoore":
                return creatButtons(this.buttonMoore)
            default:
                return creatButtons(this.buttonsTree)
        }
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
                    {this.getButtons()}


                </div>
            </ControlWrapper>
        )
    }
}

export default withComputerType(RunControl);