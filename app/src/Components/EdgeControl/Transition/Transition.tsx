import React, {AllHTMLAttributes} from "react";
import "./Transition.css";
import {TransitionParams} from "../../../Logic/IGraphTypes";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {getTransitionsTitles, transitionsToLabel} from "../../../utils";

export interface TransitionProps extends AllHTMLAttributes<HTMLElement> {
    transition: TransitionParams[],
    active: boolean,
    deleteTransition: () => void
    computerType: any
}

class Transition extends React.Component<TransitionProps, {}> {
    static defaultProps = {
        active: false
    }

    render() {
        const {transition, active, deleteTransition, className, style, ...restProps} = this.props;

        return (
            <div className={"transition " + className}
                 style={style}
                 {...restProps}
            >
                {active ? <HighlightOffIcon className="transition__remove" onClick={() => deleteTransition()}/> : null}
                {getTransitionsTitles(new Set<TransitionParams[]>([transition]), this.props.computerType)}
            </div>
        );
    }
}

export default Transition;