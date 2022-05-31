import React from "react";
import {ComputerTypeContext} from "./App";

export const withComputerType = (Component: typeof React.Component) => (
    (props: any) => (
        <ComputerTypeContext.Consumer>
            { context => <Component computerType={context} {...props}/> }
        </ComputerTypeContext.Consumer>
    )
)