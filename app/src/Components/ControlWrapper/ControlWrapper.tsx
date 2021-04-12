import React, {AllHTMLAttributes} from "react";
import "./ControlWrapper.css";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

export interface ControlWrapperProps extends AllHTMLAttributes<HTMLElement> {
    title: string,
}

interface ControlWrapperState {
    visible: boolean
}

class ControlWrapper extends React.Component<ControlWrapperProps, {}> {
    state = {
        visible: true
    }

    changeVisibility = (): void => {
        this.setState({visible: !this.state.visible});
    }

    render() {
        const {title, style, className, children, ...restProps} = this.props;
        const {visible} = this.state;

        return (
            <div className={"control-wrapper " + className}
                 style={style}
                 {...restProps}
            >

                <div className={"control-wrapper__title__row"}>
                    <div className={"control-wrapper__title"}>
                        {title}
                    </div>
                    <div className={"control-wrapper__visibility-icon"}
                         onClick={this.changeVisibility}
                    >
                        {visible ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                    </div>
                </div>

                <div className={"control-wrapper__content"}
                     style={{display: visible ? "block" : "none"}}
                >
                    {children}
                </div>
            </div>
        );
    }
}

export default ControlWrapper;