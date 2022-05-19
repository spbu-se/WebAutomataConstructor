import React from "react";
import { ComputerType, edge } from "../../react-graph-vis-types";
import { getTransitionsTitles, transitionsToLabel } from "../../utils";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import Button from "@mui/material/Button";
import "./EdgeControl.css";
import Transition from "./Transition/Transition";
import EditIcon from '@mui/icons-material/Edit';
import TextField from "@mui/material/TextField";
import { withComputerType } from "../../hoc";
import { EPS } from "../../Logic/Computer";
import { Move, TransitionParams } from "../../Logic/IGraphTypes";
import { TextareaAutosize } from "@mui/material";


interface EdgeControlProps {
    edge: edge | null,
    changeEdgeTransitions: (id: string, transitions: Set<TransitionParams[]>) => void,
    deleteEdge: (id: string) => void,
    computerType: ComputerType | null
    reinitComputer: (() => void)
}

interface Rule {
    id: number
    value: string
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    transitions: Set<TransitionParams[]>,
    transitionsText: string,
    displayedTransitionText: string,
    activeTransition: TransitionParams[] | null,
    editMode: boolean,
    countRules?: number,
    rules: Rule[],
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            transitions: this.props.edge?.transitions || new Set(),
            transitionsText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>(), this.props.computerType),
            displayedTransitionText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>(), this.props.computerType),
            activeTransition: null,
            editMode: false,
            countRules: 1,
            rules: [
                { id: 1, value: ' ' }
            ]
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {

            this.setState({
                transitions: this.props.edge?.transitions || new Set(),
                prevEdgeId: this.props.edge?.id,
                transitionsText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>(), this.props.computerType),
                activeTransition: null,
                editMode: false
            });

        }
    }

    selectTransition = (transition: TransitionParams[] | null): void => {
        if (this.state.activeTransition === transition) {
            this.setState({ activeTransition: null });
        } else {
            this.setState({ activeTransition: transition });
        }
    }

    changeTransitions = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        this.setState({ transitionsText: value });

        let accumulator: {
            fst: string | undefined,
            snd: string | undefined,
            trd: string | undefined,
            fth: string | undefined
        }[] = []
        let acc: TransitionParams[] = []

        if (this.props.computerType === "tm") {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split('')
                    let fst = tmp.shift()
                    tmp = tmp.join('').split("|" || ">")
                    let trd = tmp
                    let fth = undefined

                    let bebra = tmp.join("").split(">")
                    bebra.reverse()
                    fth = bebra.shift()
                    bebra.reverse()
                    trd = bebra

                    accumulator.push({ fst: EPS, snd: fst, trd: trd.join(':'), fth: fth })
                })

        }
        if (this.props.computerType === "mealy" || this.props.computerType === "dmealy") {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split("|")
                    let fst = tmp.shift()
                    let snd = tmp.shift()
                    accumulator.push({ fst: fst, snd: snd, trd: undefined, fth: undefined })
                })

            accumulator.forEach(value => {
                if (value.fst !== undefined) {
                    acc.push(
                        {
                            title: value.fst === 'eps' ? EPS : value.fst,
                            output: value.snd
                        }
                    )
                }
            })
        }
        else {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split(",")
                    let fst = tmp.shift()
                    tmp = tmp.join('').split("|" || ">")
                    let snd = tmp.shift()
                    let trd = tmp
                    accumulator.push({ fst: fst, snd: snd, trd: trd.join(':'), fth: undefined })
                })

            accumulator.forEach(value => {
                if (value.fst !== undefined) {
                    acc.push(
                        {
                            title: value.fst === 'eps' ? EPS : value.fst,
                            stackDown: value.snd === 'eps' ? EPS : value.snd,
                            stackPush: value.trd?.split(':').map(value => value === 'eps' ? EPS : value),
                            move: value.fth === 'L' ? Move.L : value.fth === 'R' ? Move.R : undefined
                        }
                    )
                }
            })
        }


        let transitions: Set<TransitionParams[]> = new Set<TransitionParams[]>([acc])

        this.props.changeEdgeTransitions(this.props.edge!.id!, transitions)
        console.log("ALLLOO")
        /////
        // await this.props.reinitComputer()
        ///
        this.setState({
            transitionsText: value
            , transitions: transitions
        }, () => this.props.reinitComputer());
    }

    deleteEdge = async (): Promise<void> => {
        if (this.props.edge !== null) {
            this.props.deleteEdge(this.props.edge.id!);
        }
        await this.props.reinitComputer()

    }

    private addInstruction(value: string) {
        let newRow = { id: this.state.rules.length, value: value };
        this.setState({ rules: this.state.rules.concat(newRow) });
    }

    changeEditMode = () => {
        this.setState({ editMode: !this.state.editMode });
        this.updateTransitions();

    }

    updateTransitions = async () => {
        let accumulator: {
            fst: string | undefined,
            snd: string | undefined,
            trd: string | undefined,
            fth: string | undefined
            out: string | undefined
        }[] = []

        if (this.props.computerType === "tm") {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split('')
                    let fst = tmp.shift()
                    tmp = tmp.join('').split("|" || ">")
                    let trd = tmp
                    let fth = undefined

                    let bebra = tmp.join("").split(">")
                    bebra.reverse()
                    fth = bebra.shift()
                    bebra.reverse()
                    trd = bebra
                    console.log("tmp")
                    console.log(bebra)

                    accumulator.push({ fst: EPS, snd: fst, trd: trd.join(':'), fth: fth, out: undefined })
                })

        }
        if (this.props.computerType === "mealy" || this.props.computerType === "dmealy") {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split("|")
                    let fst = tmp.shift()
                    let snd = tmp.shift()
                    accumulator.push({ fst: fst, snd: undefined, trd: undefined, fth: undefined, out: snd })
                })
        }
        else {
            this.state.transitionsText
                .split('')
                .filter(x => x !== " " && x !== "\n")
                .join('')
                .split(";")
                .forEach(value => {
                    let tmp = value.split(",")
                    let fst = tmp.shift()
                    tmp = tmp.join('').split("|" || ">")
                    let snd = tmp.shift()
                    let trd = tmp
                    accumulator.push({ fst: fst, snd: snd, trd: trd.join(':'), fth: undefined, out: undefined })
                })
        }


        let acc: TransitionParams[] = []
        accumulator.forEach(value => {
            if (value.fst !== undefined) {
                acc.push(
                    {
                        title: value.fst === 'eps' ? EPS : value.fst,
                        stackDown: value.snd === 'eps' ? EPS : value.snd,
                        stackPush: value.trd?.split(':').map(value => value === 'eps' ? EPS : value),
                        move: value.fth === 'L' ? Move.L : value.fth === 'R' ? Move.R : undefined,
                        output: value.out,

                    }
                )
            }
        })

        let transitions: Set<TransitionParams[]> = new Set<TransitionParams[]>([acc])

        this.setState({
            transitionsText: getTransitionsTitles(transitions, this.props.computerType),
            transitions: transitions
        })
        ///
        await this.props.reinitComputer()
        ///
    }

    deleteTransition = (): void => {
        if (this.props.edge !== null && this.state.activeTransition !== null) {
            const transitions = this.state.transitions;
            transitions.delete(this.state.activeTransition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({ transitions: transitions, transitionsText: getTransitionsTitles(transitions, this.props.computerType) });
        }
    }

    helperText = () => {
        switch (this.props.computerType) {
            case "dfa":
            case "nfa":
            case "nfa-eps":
            case "moore":
            case "dmoore":
                return 'Список символов или "eps" через точку с запятой';
            case "dmealy":
            case "mealy":
                return '"f | n;", "eps" для ε'
            case "dpda":
            case "pda":
                return '"a, a | a:Z0;", "eps" для ε. На дне стека "Z0"'
            case "tm":
                return '"a | a>R;", eps для ε. "R" - вправо, "L" - влево'
            default: 
                return '';
        }
    }


    render() {
        return (
            <ControlWrapper title="Переход" visible={this.props.edge !== null}>
                <div className="edge-control__container">
                    <div className="edge-control__item edge-control__transitions">
                        {
                            <TextField
                                id="filled-multiline-static"
                                multiline
                                rows={3}
                                variant="standard"
                                label="Переходы"
                                size="small"
                                value={this.state.transitionsText}
                                onChange={this.changeTransitions}
                                helperText={this.helperText()}
                                onBlur={this.updateTransitions}
                            />
                        }

                        <div className="edge-control__edit-transitions"
                            onClick={this.changeEditMode}>
                            <EditIcon />
                        </div>

                    </div>


                    <div className="edge-control__item">
                        <Button
                            onClick={this.deleteEdge}
                        >
                            Удалить
                        </Button>
                    </div>

                </div>
            </ControlWrapper>
        );
    }
}

export default withComputerType(EdgeControl);