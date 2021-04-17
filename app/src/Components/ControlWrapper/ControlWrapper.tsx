import React, {AllHTMLAttributes} from "react";
import "./ControlWrapper.css";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

export interface ControlWrapperProps extends AllHTMLAttributes<HTMLElement> {
    title: string,
    visible: boolean
}

class ControlWrapper extends React.Component<ControlWrapperProps, {}> {
    static defaultProps = {
        visible: true
    }

    render() {
        const {visible, title, style, className, children, ...restProps} = this.props;

        return (
            <Paper className={`control-wrapper${visible ? "" : "--hidden"} ${className}`}
                   variant="outlined"
                   style={style}
                   {...restProps}
            >
                <div className="control-wrapper--content">
                <div>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </div>

                <div>
                    {children}
                </div>
                </div>
            </Paper>
        );
    }
}

export default ControlWrapper;