import React, {AllHTMLAttributes} from "react";
import "./PopoutWrapper.css";

class PopoutWrapper extends React.Component<AllHTMLAttributes<HTMLElement>, {}> {
    render() {
        const { className, style, ...restProps } = this.props;

        return (
            <div
                className={"popout-wrapper__wrapper " + className}
                style={style}
                {...restProps}
            >
                <div className="popout-wrapper__fade"/>
                <div className="popout-wrapper">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default PopoutWrapper;