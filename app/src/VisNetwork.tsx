import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { FullItem } from "vis-data/declarations/data-interface";
import {
    DataSet,
    Network,
    Options,
    Data,
} from "vis-network/standalone/esm/vis-network";
import { Move, NodeCore } from "./Logic/IGraphTypes";
import {edge, graph, node } from "./react-graph-vis-types";
import {Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";

interface PropsVisNet {
    nodes: DataSet<node>,
    edges: DataSet<edge>,
    data: {nodes: DataSet<node, "id">, edges: DataSet<edge, "id">},
    onDoubleClick: (params?: any) => void,
    onClick1: (params?: any) => void,
    onClick2: (params?: any) => void,
    onClick3: (params?: any) => void,
    onClick4: (params?: any) => void,
    network: any,
    contextMenu?: any
}



export const VisNetwork = (props: PropsVisNet) => {
    // A reference to the div rendered by this component
    const [domNode, setdomNode] = useState(useRef<HTMLDivElement>(null));

    const [options, setOptions] = useState<Options>({
        edges: {
            smooth: {
                enabled: true,
                type: "discrete",
                roundness: 0.5
            },
            // color: {
            //     //color:'#848484',
            //     highlight:'#848484',
            //     hover: '#d3d2cd',
            //     inherit: true,
            //     opacity:1.0
            // },
            color: "#000000",
            width: 0.5,
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.5
                }
            },
            length: 200
        },
        layout: {improvedLayout:false},
        nodes: {
            shapeProperties: {
                interpolation: false
            },
            shape: "circle",
            font: "18px Roboto black",
            labelHighlightBold: false,
            size: 40,
            borderWidth : 2,
            color: {
                background: "#ffffff",
                border: "#000000",
                highlight: {
                    border: "#000000",
                    background: "#ffffff"
                }
            },
            // color: "#ffffff",
        },
        physics: {
            enabled: false
        }
    });

    const [input, setInput] = useState("")

    const [elements, setElements] = useState<graph>({ edges: [], nodes: [] })

    const [contextMenu, setContextMenu] = React.useState<{mouseX: any, mouseY: any} | null>(null);

    const handleContextMenu = (event: { preventDefault: () => void; clientX: number; clientY: number; }) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    useLayoutEffect(() => {

        if (domNode.current) {
            props.network.current = new Network(domNode.current, props.data, options);
        }

        window.addEventListener("contextmenu", e => e.preventDefault());

        document.addEventListener("keydown", (event) => {
            if (props.network.current) {
                if (event.ctrlKey) {
                    props.network.current.addEdgeMode();
                }
            }
        })

        document.addEventListener("keyup", (event) => {
            if (props.network.current) {
                props.network.current.disableEditMode();
            }
        })

        if (props.network.current) {
            props.network.current.on('doubleClick', props.onDoubleClick)
            props.network.current.on('click', props.onClick1);
            props.network.current.on('click', props.onClick2);
            props.network.current.on('click', props.onClick3);
            props.network.current.on('click', props.onClick4);
            // props.network.current.on('click', () => {
            //     setShowMenu(false)
            // });
            // props.network.current.on('contextmenu', handleContextMenu);
        }

    }, [domNode, props.network, props.data, options]);

    const refContainer = () => {
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                }}
                ref={domNode}
            />
        );
    }

    return (
        props.contextMenu === undefined
            ?
                refContainer()
            :
                <div onContextMenu={handleContextMenu}
                     style={{
                         height: "100%",
                         width: "100%",
                }}>
                    {refContainer()}
                    <Menu
                        open={contextMenu !== null}
                        onClose={handleClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            contextMenu !== null
                                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                : undefined
                        }
                    >
                        {props.contextMenu(handleClose, handleContextMenu)}
                    </Menu>
                </div>
    );
};