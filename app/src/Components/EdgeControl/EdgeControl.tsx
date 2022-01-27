import React from "react";
import {ComputerType, edge} from "../../react-graph-vis-types";
import {getTransitionsTitles, transitionsToLabel} from "../../utils";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import Button from "@mui/material/Button";
import "./EdgeControl.css";
import Transition from "./Transition/Transition";
import EditIcon from '@mui/icons-material/Edit';
import TextField from "@mui/material/TextField";
import {withComputerType} from "../../hoc";
import {EPS} from "../../Logic/Computer";
import {Move, TransitionParams} from "../../Logic/IGraphTypes";
import { TextareaAutosize } from "@mui/material";


interface EdgeControlProps {
    edge: edge | null,
    changeEdgeTransitions: (id: string, transitions: Set<TransitionParams[]>) => void,
    deleteEdge: (id: string) => void,
    computerType: ComputerType | null
}

interface Rule{
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
            transitionsText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>()),
            displayedTransitionText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>()),
            activeTransition: null,
            editMode: false,
            countRules: 1,
            rules: [
                {id: 1, value: ' '}
            ]
        }
    }

    componentDidUpdate(prevProps: Readonly<EdgeControlProps>, prevState: Readonly<EdgeControlState>) {
        if (this.props.edge?.id !== prevState.prevEdgeId) {
            this.setState({
                transitions: this.props.edge?.transitions || new Set(),
                prevEdgeId: this.props.edge?.id,
                transitionsText: getTransitionsTitles(this.props.edge?.transitions || new Set<TransitionParams[]>()),
                activeTransition: null,
                editMode: false
            });
        }
    }

    selectTransition = (transition: TransitionParams[] | null): void => {
        if (this.state.activeTransition === transition) {
            this.setState({activeTransition: null});
        } else {
            this.setState({activeTransition: transition});
        }
    }

    changeTransitions = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        this.setState({transitionsText: value});

        let t: { fst: string | undefined, snd: string | undefined, trd: string | undefined, fth: string | undefined }[] = []

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
                    let snd = tmp.shift()
                    let trd = tmp
                    let fth = undefined

                    let bebra = tmp.join("").split(">")
                    bebra.reverse()
                    fth = bebra.shift()
                    bebra.reverse()
                    trd = bebra
                    console.log("tmp")
                    console.log(bebra)

                    t.push({ fst: EPS, snd: snd, trd: trd.join(':'), fth: fth })
                })

        } else {
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
                    // let fth = undefined

                    // if (this.props.computerType === "tm") {
                    //     let bebra = tmp.join("").split(">")
                    //     bebra.reverse()
                    //     fth = bebra.shift()
                    //     bebra.reverse()
                    //     trd = bebra
                    //     console.log("tmp")
                    //     console.log(bebra)
                    // }

                    t.push({ fst: fst, snd: snd, trd: trd.join(':'), fth: undefined })
                })
        }


        let acc: TransitionParams[] = []
        t.forEach(value => {
            if (value.fst !== undefined) {
                acc.push(
                    {
                        title: value.fst === 'eps' ? EPS : value.fst,
                        stackDown: value.snd === 'eps' ? EPS : value.snd,
                        stackPush: value.trd?.split(':').map(value => value === 'eps' ? EPS : value),
                        move: value.fth !== undefined ? value.fth === 'L' ? Move.L : Move.R : undefined
                    }
                )
            }
        })

        let transitions: Set<TransitionParams[]> = new Set<TransitionParams[]>([acc])
        this.props.changeEdgeTransitions(this.props.edge!.id!, transitions)
        this.setState({transitionsText:
            value
            , transitions: transitions
        });

    }

    deleteEdge = (): void => {
        if (this.props.edge !== null) {
            this.props.deleteEdge(this.props.edge.id!);
        }
    }
    
    private addInstruction(value: string) {
        let newRow = {id: this.state.rules.length, value: value};
        this.setState({rules: this.state.rules.concat(newRow)});
    }
    
    changeEditMode = () => {
         this.setState({editMode: !this.state.editMode});
         this.updateTransitions();
     }
    
    updateTransitions = () => {
        // const transitions = new Set<TransitionParams[]>();
        //
        // let t: { fst: string | undefined, snd: string | undefined, trd: string | undefined, fth: string | undefined }[] = []
        // this.state.transitionsText
        //     .split('')
        //     .filter(x => x !== " " && x !== "\n")
        //     .join('')
        //     .split(";")
        //     .forEach(value => {
        //         let tmp = value.split(",")
        //         let fst = tmp.shift()
        //         tmp = tmp.join('').split("|")
        //         let snd = tmp.shift()
        //         let trd = tmp
        //         let fth
        //
        //         if (this.props.computerType === "tm") {
        //             let bebra = tmp.join("").split(">")
        //             bebra.reverse()
        //             fth = bebra.shift()
        //             bebra.reverse()
        //             trd = bebra
        //             console.log("tmp")
        //             console.log(bebra)
        //         }
        //
        //         t.push({ fst: fst, snd: snd, trd: trd.join(':'), fth: fth })
        //     })
        // // t.forEach(value =>  console.log(value))
        // let acc: TransitionParams[] = []
        // t.forEach(value => {
        //     if (value.fst !== undefined) {
        //         acc.push(
        //             {
        //                 title: value.fst === 'eps' ? EPS : value.fst,
        //                 stackDown: value.snd === 'eps' ? EPS : value.snd,
        //                 stackPush: value.trd?.split(':').map(value => value === 'eps' ? EPS : value),
        //
        //                 move: value.fth === 'L' ? Move.L : Move.R
        //             }
        //         )
        //     }
        // })
        // acc = acc.filter(x => x.title.length > 0)
        // transitions.add(acc)
        // this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
        // this.setState({
        //     transitionsText: getTransitionsTitles(transitions),
        //     transitions: transitions
        // })
    }

    deleteTransition = (): void => {
        if (this.props.edge !== null && this.state.activeTransition !== null) {
            const transitions = this.state.transitions;
            transitions.delete(this.state.activeTransition);

            this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
            this.setState({transitions: transitions, transitionsText: getTransitionsTitles(transitions)});
        }
    }



    render() {
        return (
            // (this.props.computerType !== "pda")?
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
                                    helperText={this.props.computerType === "nfa-eps" || "pda" ? 'Список символов или "eps" через запятую' : "Список символов через запятую"}
                                    onBlur={this.updateTransitions}
                                />
                        }

                        <div className="edge-control__edit-transitions"
                             onClick={this.changeEditMode}>
                            <EditIcon/>
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