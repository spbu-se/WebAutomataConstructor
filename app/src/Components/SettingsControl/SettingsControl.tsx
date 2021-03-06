import React from "react";

interface settingsControlProps {
    enterEdgeMode: () => void;
    leaveEdgeMode: () => void;
    inEdgeMode: boolean;
}

interface settingsControlState {

}

class SettingsControl extends React.Component<settingsControlProps, settingsControlState> {
    constructor(props: settingsControlProps) {
        super(props);

        this.state = {}
    }

    render() {
        return (
            <div className="settings-control__container">
                <button
                    className="settings-control__edge-mode-button"
                    onClick={this.props.inEdgeMode ? this.props.leaveEdgeMode : this.props.enterEdgeMode}
                >
                    {this.props.inEdgeMode ? "leave edge mode" : "enter edge mode"}
                </button>
            </div>
        )
    }
}

export default SettingsControl;