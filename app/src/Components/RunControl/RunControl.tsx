import React, {ChangeEvent} from "react";

interface runControlProps {

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

    render() {
        return (
            <div className="run-control__container">
                <input
                    className="run-control__input"
                    value={this.state.input}
                    onChange={this.onInputChanged}
                />
            </div>
        )
    }
}

export default RunControl;