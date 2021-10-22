import React from "react";
import {ComputerType, edge} from "../../react-graph-vis-types";
import {transitionsToLabel,  stackDownToLabel, stackPushToLabel} from "../../utils";
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import Button from "@material-ui/core/Button";
import "./EdgeControl.css";
import Transition from "./Transition/Transition";
import EditIcon from '@material-ui/icons/Edit';
import TextField from "@material-ui/core/TextField";
import {withComputerType} from "../../hoc";
import {EPS} from "../../Logic/Computer";
import {TransitionParams} from "../../Logic/IGraphTypes";
import Input from '@material-ui/core/Input';
import Typography from "@material-ui/core/Typography";

interface EdgeControlProps {
    edge: edge | null,
    changeEdgeTransitions: (id: string, transitions: Set<TransitionParams>) => void,
    deleteEdge: (id: string) => void,
    computerType: ComputerType | null
}

interface Rule{
    id: number
    value: string
}

interface EdgeControlState {
    prevEdgeId: string | undefined,
    transitions: Set<TransitionParams>,
    transitionsText: string,
    activeTransition: TransitionParams | null,
    editMode: boolean,
    countRules?: number, 
    rules: Rule[],
    stackDownText: string,
    stackPushText: string
}

class EdgeControl extends React.Component<EdgeControlProps, EdgeControlState> {
    constructor(props: EdgeControlProps) {
        super(props);

        this.state = {
            prevEdgeId: this.props.edge?.id,
            transitions: this.props.edge?.transitions || new Set(),
            transitionsText: transitionsToLabel(this.props.edge?.transitions || new Set()),
            activeTransition: null,
            editMode: false, 
            countRules: 1, 
            //stackDownText: this.props.edge?.stackDown || new Set(),
            stackDownText: stackDownToLabel(this.props.edge?.transitions || new Set()),
            stackPushText: stackPushToLabel(this.props.edge?.transitions || new Set()),
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
                transitionsText: transitionsToLabel(this.props.edge?.transitions || new Set()),
                activeTransition: null,
                editMode: false
            });
        }
    }

    deleteTransition = (): void => {
    }

    selectTransition = (transition: TransitionParams | null): void => {
        if (this.state.activeTransition === transition) {
            this.setState({activeTransition: null});
        } else {
            this.setState({activeTransition: transition});
        }
    }

    changeTransitions = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        this.setState({transitionsText: value});

        if (value.slice(-1) === ",") {
            const transitions: Set<TransitionParams> = new Set<TransitionParams>(
                value
                .split(",")
                .map(transition => transition === "eps" && this.props.computerType === "nfa-eps" ? {title: EPS} : {title: transition})
            );

            this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
            this.setState({transitionsText: transitionsToLabel(transitions)}
            );
        }
    }
    changeStackDown = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        this.setState({stackDownText: value});   
        if (value.slice(-1) === ",") {
            const transitions: Set<TransitionParams> = new Set<TransitionParams>(
                value
                .split(",")
                .map(transition => transition === "eps" && this.props.computerType === "pda"? {title:EPS, stackDown: EPS} : {title: transition, stackDown: transition})
            );

            this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
            this.setState({transitionsText: transitionsToLabel(transitions)}
            );
        }
    }
    
    changeStackPush = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        this.setState({stackPushText: value});

        if (value.slice(-1) === ",") {
            const transitions: Set<TransitionParams> = new Set<TransitionParams>(
                //value
                //.split(",")
                //.map(stack => stack === "eps" && this.props.computerType === "pda"?  {title: EPS, stackPush[0]: EPS} : {title: stack, stackPush[0]: stack})
            );
            
            //this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
            this.setState({stackPushText: stackDownToLabel(transitions)}
            );
        }
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
    
     //deleteTransition = (): void => {
       //  if (this.props.edge !== null && this.state.activeTransition !== null) {
         //    const transitions = this.state.transitions;
           //  transitions.delete(this.state.activeTransition);
    
             //this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
             //this.setState({transitions: transitions, transitionsText: transitionsToLabel(transitions)});
         //}
     //}
    
     changeEditMode = () => {
         this.setState({editMode: !this.state.editMode});
         this.updateTransitions();
     }
    
    updateTransitions = () => {
        const transitions = new Set(this.state.transitionsText
            .replace(/,$/, '')
            .split(",")
            .map(transition => transition === "eps" && this.props.computerType === "nfa-eps" ? {title:EPS} : {title:transition}));

        this.props.changeEdgeTransitions(this.props.edge!.id!, transitions);
        this.setState({transitionsText: transitionsToLabel(transitions), transitions: transitions})
    }
    
    private addRulesInBlock() {
        return this.state.rules.map((rule, index) =>
        <div> <Input 
        defaultValue={rule.value}
        value={rule.value}
        /></div>
        )
    }
    // deleteEdge = (): void => {
    //     if (this.props.edge !== null) {
    //         this.props.deleteEdge(this.props.edge.id!);
    //     }
    // }
    //

    //
    // deleteTransition = (): void => {
    //     if (this.props.edge !== null && this.state.activeTransition !== null) {
    //         const transitions = this.state.transitions;
    //         transitions.delete(this.state.activeTransition);
    //
    //         this.props.changeEdgeTransitions(this.props.edge.id!, transitions);
    //         this.setState({transitions: transitions, transitionsText: transitionsToLabel(transitions)});
    //     }
    // }
    //

    //
    // changeEditMode = () => {
    //     this.setState({editMode: !this.state.editMode});
    //     this.updateTransitions();
    // }
    //

    render() {
        return (
            (this.props.computerType !== "pda")?
            <ControlWrapper title="Переход" visible={this.props.edge !== null}>
                <div className="edge-control__container">
                    <div className="edge-control__item edge-control__transitions">
                        {
                            this.state.editMode ?
                                <TextField
                                    label="Переходы"
                                    value={this.state.transitionsText}
                                    onChange={this.changeTransitions}
                                    helperText={this.props.computerType === "nfa-eps" ? 'Список символов или "eps" через запятую' : "Список символов через запятую"}
                                    onBlur={this.updateTransitions}
                                />
                                :
                                Array.from(this.state.transitions || []).map((transition, index) => (
                                    <Transition
                                        key={index}
                                        className="edge-control__transition"
                                         transition={(transition.title === EPS) ? {title: "ε"} : transition}
                                         active={this.state.activeTransition === transition}
                                         deleteTransition={this.deleteTransition}
                                         onClick={() => this.selectTransition(transition)}
                                    />
                                ))
                        }

                        {/*<div className="edge-control__edit-transitions"*/}
                        {/*     onClick={this.changeEditMode}>*/}
                        {/*    <EditIcon/>*/}
                        {/*</div>*/}

                    </div>

                    <div className="edge-control__item">
                        {/*<Button*/}
                        {/*    color="secondary"*/}
                        {/*    onClick={this.deleteEdge}*/}
                        {/*>*/}
                        {/*    Удалить*/}
                        {/*</Button>*/}
                    </div>

                </div>
            </ControlWrapper>
            :
            <ControlWrapper title="Правила перехода" visible={this.props.edge !== null}> 
                <TextField
                    label="Переход"
                    value={this.state.transitionsText}
                    onChange={this.changeTransitions}
                    helperText={'Символ или "eps"'}
                    onBlur={this.updateTransitions}
                />
                <TextField
                    label="Извлечь из стека"
                    value={this.state.stackDownText}
                    onChange={this.changeStackDown}
                    helperText={'Символ или "eps"'}
                    /*onBlur={this.updateTransitions}*/
                /> 
                <TextField
                    label="Поместить в стек"
                    value={this.state.stackPushText}
                    onChange={this.changeStackPush}
                    helperText={'Список символов или "eps" через запятую'}
                    /*onBlur={this.updateTransitions}*/
                />

                <div className="edge-control__item edge-control__buttons">
                {
                    <div className="edge-control__button">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => this.addInstruction(this.state.transitionsText)}
                        >
                            Добавить
                        </Button>
                    </div>
                }
                </div>

                <div className="edge-control__item">
                {
                    (this.state.editMode) ?
                        (<div className="edge-control__header">
                            <Typography variant="h6">Правила</Typography>
                                </div> &&
                                <div className="edge-control__placeholder"> Здесь будет отображаться список правил для выбранного ребра </div>)
                            : (!this.state.editMode) ?
                                <div className="edge-control__header">
                                    <Typography variant="h6">Правила</Typography>
                                </div>
                            : null
                         }
                </div> 
                <div className="edge-control__item">
                    {this.addRulesInBlock()}
                </div> 
            
                
            </ControlWrapper>
            );
        }
}

export default withComputerType(EdgeControl);