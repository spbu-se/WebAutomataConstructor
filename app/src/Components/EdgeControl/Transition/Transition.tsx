import React, {AllHTMLAttributes} from "react";
import "./Transition.css";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import {TransitionParams} from "../../../Logic/IGraphTypes";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export interface TransitionProps extends AllHTMLAttributes<HTMLElement> {
    transition: TransitionParams[],
    active: boolean,
    deleteTransition: () => void
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
                {transition.map(value => value.title)}
            </div>
        );
    }
}

export default Transition;