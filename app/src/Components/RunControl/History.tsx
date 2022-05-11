import React, { ChangeEvent } from "react";

import { node } from "../../react-graph-vis-types";
import Tooltip from '@mui/material/Tooltip';
import Typography from "@mui/material/Typography";

export const History = (props: {
    startNode: node, history: {
        a: node;
        b: string[] | undefined;
    }[][], historyEndRef: any
}) => {
    return (
        <div className="run-control__item run-control__history">
            <div className="run-control__history__header">
                <Typography variant="h6">История</Typography>
            </div>
            {
                props.history.length !== 0 ?
                    <div className="run-control__history__scroll">


                        {
                            props.startNode !== undefined
                                ?
                                <div className="run-control__history__row" key={0}>
                                    <span className="run-control__history__index">{0}</span>
                                    {
                                        <Tooltip
                                            title={<Typography className="display-linebreak">{"~"}</Typography>}>
                                            <div
                                                className="run-control__history__node"
                                                style={{ border: `${props.startNode.isInitial ? "#0041d0" : props.startNode.isAdmit ? "#ff0072" : "#000000"} 2px solid` }}
                                            >
                                                {props.startNode!.label}

                                            </div>
                                        </Tooltip>
                                    }

                                </div>
                                : <div />
                        }

                        {
                            props.history.map((nodes, index) => (
                                <div className="run-control__history__row" key={index}>
                                    <span className="run-control__history__index">{index + 1}</span>
                                    {
                                        nodes.map((node, index) => (
                                            <Tooltip
                                                title={<Typography className="display-linebreak">{node.b !== undefined ? node.b.join('\n') : ''}</Typography>}>
                                                <div
                                                    className="run-control__history__node"
                                                    style={{ border: `${node.a.isInitial ? "#0041d0" : node.a.isAdmit ? "#ff0072" : "#000000"} 2px solid` }}
                                                >
                                                    {node.a.label}

                                                </div>
                                            </Tooltip>
                                        ))
                                    }

                                </div>
                            ))
                            
                        }
                                        <div>
                                            {/* {console.log(nodes)} */}
                                            <div ref={props.historyEndRef} />
                                        </div>

                    </div>
                    :
                    <div className="run-control__history__placeholder">
                        Используйте пошаговый запуск, чтобы наблюдать за историей

                    </div>
            }


        </div>)
}
