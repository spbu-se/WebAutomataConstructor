import { ComputerType } from "./react-graph-vis-types"
import React, { ReactNode } from 'react';

interface RibbonProps {
    computerType: null | ComputerType,
    wasComputerResetted: boolean,
    mem: string[] | undefined,
    ptr: number | undefined
    memRef: React.RefObject<HTMLDivElement>
}

export const Ribbon = (props: RibbonProps) => {
    return (
        props.computerType === "tm" && props.wasComputerResetted
            ?
            <div className="app__mem_ribbon">
                {
                    props.mem?.map((value, index) =>
                        <div
                            className="app__mem_cell"
                            style={{ border: `${index === props.ptr ? "#0041d0" : "#000000"} 2px solid` }}
                        >
                            {Math.abs(Math.abs(index) - Math.abs(props.ptr!)) <= 5
                                ? <div ref={props.memRef} />
                                : <div />
                            }
                            {value}
                            {props.memRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                        </div>
                    )
                }
            </div>
            : <div />
    )
}
