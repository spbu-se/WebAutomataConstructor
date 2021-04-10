import React, {AllHTMLAttributes} from "react";
import "./ComputerTypePopout.css";
import PopoutWrapper from "../PopoutWrapper/PopoutWrapper";
import GitHubIcon from '@material-ui/icons/GitHub';
import {computersInfo} from "../../utils";
import {ComputerType} from "../../react-graph-vis-types";

interface ComputerTypePopoutProps extends AllHTMLAttributes<HTMLElement> {
    changeComputerType: (computerType: null | ComputerType) => void;
}

class ComputerTypePopout extends React.Component<ComputerTypePopoutProps, {}> {
    render() {
        const {changeComputerType, className, style, ...restProps} = this.props;

        return (
            <PopoutWrapper
                className={"computer-type-popout__wrapper " + className}
                style={style}
                {...restProps}
            >
                <div className="computer-type-popout__content">
                    <div className="computer-type-popout__header">
                        Computer workbench
                    </div>
                    <div className="computer-type-popout__sections">
                        <div className="computer-type-popout__templates">
                            <div className="computer-type-popout__section__header">
                                Templates
                            </div>
                            <div className="computer-type-popout__templates__container">
                                {
                                    Object.entries(computersInfo).map(entry =>
                                        <div className="computer-type-popout__templates__card">
                                            <img className="computer-type-popout__templates__card__preview"
                                                 src={`/media/images/${entry[1].preview}`}
                                                 alt={`${entry[1].name} preview`}
                                            />
                                            <div className="computer-type-popout__templates__card__name">
                                                {entry[1].name}
                                            </div>
                                            <div className="computer-type-popout__templates__card__description">
                                                {entry[1].description}
                                            </div>
                                            <button className="computer-type-popout__templates__card__create-button"
                                                    onClick={() => this.props.changeComputerType(entry[0] as ComputerType)}
                                            >
                                                Create
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="computer-type-popout__credits">
                            <div className="computer-type-popout__section__header">
                                Credits
                            </div>
                            <div className="computer-type-popout__credits__line">
                                <div className="computer-type-popout__credits__line__icon">
                                    <GitHubIcon/>
                                </div>
                                <div className="computer-type-popout__credits__line__link">
                                    <a href="https://github.com/spbu-se/WebAutomataConstructor">https://github.com/spbu-se/WebAutomataConstructor</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoutWrapper>
        );
    }
}

export default ComputerTypePopout;