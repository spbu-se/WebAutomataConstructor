import React, { ChangeEvent } from "react";
import { graph } from "../../react-graph-vis-types";

interface runControlProps {
    elements: graph
}

interface runControlState {
    input: string
}

class RunControl extends React.Component<runControlProps, runControlState> {
    constructor(props: runControlProps) {
        super(props);

        this.state = {
            input: ""
        };
    }

    onInputChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        this.setState({input: event.target.value});
    }

    onStepClicked = (): void => {

    }

    onRunClicked = (): void => {

    }

    render() {
        return (
            <div className="run-control__container">
                <input
                    className="run-control__input"
                    value={this.state.input}
                    onChange={this.onInputChanged}
                />
                <button
                    className="run-control__step-button"
                    onClick={this.onStepClicked}
                >
                    Step
                </button>
                <button
                    className="run-control__run-button"
                    onClick={this.onRunClicked}
                >
                    Run
                </button>
            </div>
        )
    }
}

export default RunControl;