import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import {
    Network,
    Options,
    Data, 
} from "vis-network/peer";
import { DataSet } from "vis-data/peer";
import { Timeline } from "vis-timeline/peer";
import { Move, NodeCore } from "./Logic/IGraphTypes";
import { edge, graph, node } from "./react-graph-vis-types";
import { Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import { useKey } from "rooks";

interface PropsVisNet {
    nodes: DataSet<node>,
    edges: DataSet<edge>,
    data: { nodes: DataSet<node, "id">, edges: DataSet<edge, "id"> },
    onDoubleClick: (params?: any) => void,
    onClick1: (params?: any) => void,
    onClick2: (params?: any) => void,
    onClick3: (params?: any) => void,
    onClick4: (params?: any) => void,
    network: any,
    contextMenu?: any
}

export const MyUseKey = (key: any, condition: boolean) => {
    const [isKeyPressed, setIsKeyPressed] = useState(false)

    const downHadler = (k: any) => {
        if (key === k) setIsKeyPressed(true)
    }

    const upHadler = (k: any) => {
        if (key !== k) setIsKeyPressed(false)
    }

    useEffect(() => {
        if (condition) {
            window.addEventListener('keydown', downHadler)
            window.addEventListener('keyup', upHadler)

            return () => {
                window.removeEventListener('keydown', downHadler)
                window.removeEventListener('keyup', upHadler)
            }
        }
    }, [])
    return isKeyPressed
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
        manipulation: {
            enabled: false,
            addEdge: function (data: { from: any; to: any; }, callback: (arg0: any) => void) {
                console.log('add edge', data);
                callback(data);
                setKeyPressed(false)
                props.network.current.disableEditMode()
            }

        },
        layout: { improvedLayout: false },
        nodes: {
            shapeProperties: {
                interpolation: false
            },
            shape: "circle",
            font: "18px Roboto black",
            labelHighlightBold: false,
            size: 40,
            borderWidth: 2,
            color: {
                background: "#ffffff",
                border: "#000000",
                highlight: {
                    border: "#000000",
                    background: "#ffffff"
                }
            },
        },
        physics: {
            enabled: false
        }
    });

    const [contextMenu, setContextMenu] = React.useState<{ mouseX: any, mouseY: any } | null>(null);

    const handleContextMenu = (event: { preventDefault: () => void; clientX: number; clientY: number; }) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
                : null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const [keyPressed, setKeyPressed] = useState<boolean>(false);

    const handleUserKeyPress = useCallback(event => {
        if (event.keyCode === 17) {
            if (!keyPressed) {
                console.log('handleUserKeyPress')
                props.network.current.addEdgeMode();
                setKeyPressed(true);
                console.log('-->' + keyPressed)
            }
        }
    }, [keyPressed]);


    const handleUserKeyUnPress = useCallback(event => {
        if (event.keyCode === 17) {
            if (keyPressed) {
                console.log('handleUserKeyUnPress')
                props.network.current.disableEditMode();
                setKeyPressed(false);
                console.log('-->' + keyPressed)
            }
        }
    }, [keyPressed]);


  const [container, _co] = useState(useRef<HTMLDivElement>(null)) ;

  const items = new DataSet([
    { id: 1, content: "item 1", start: "2014-04-20" },
    { id: 2, content: "item 2", start: "2014-04-14" },
    { id: 3, content: "item 3", start: "2014-04-18" },
    { id: 4, content: "item 4", start: "2014-04-16", end: "2014-04-19" },
    { id: 5, content: "item 5", start: "2014-04-25" },
    { id: 6, content: "item 6", start: "2014-04-27", type: "point" }
  ]);

  const timeLineOptions = {};


    useEffect(() => {
        window.addEventListener("keydown", handleUserKeyPress);
        window.addEventListener("keyup", handleUserKeyUnPress);
        
        console.log('--' + keyPressed)
        return () => {
            window.removeEventListener("keydown", handleUserKeyPress);
            window.removeEventListener("keyup", handleUserKeyUnPress);
        };
    }, [handleUserKeyPress])

    const timeline = React.createRef<Timeline | null>();

    useLayoutEffect(() => {

        if (domNode.current) {
            props.network.current = new Network(domNode.current, props.data, options);
            console.log("HERE<-domNode.current")
        }

        console.log("HERE<-")
        window.addEventListener("contextmenu", e => e.preventDefault());

        if (props.network.current) {
            props.network.current.on('doubleClick', (params: any) => {
                setKeyPressed(false)
                props.onDoubleClick(params)
            })
            props.network.current.on('click', props.onClick1);
            props.network.current.on('click', props.onClick2);
            props.network.current.on('click', props.onClick3);
            props.network.current.on('click', props.onClick4);
            props.network.current.on('click', props.onClick4);

            props.network.current.on('dragging', () => {
                props.network.current.unselectAll();
            });


            props.network.current.on('controlNodeDragging', () => {
                props.network.current.unselectAll();
            });
            
        }


    }, [domNode, props.data, props.network, options]);

    const refContainer = () => {
        return (
            <div id={"network"}
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