import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import {
    DataSet,
    Network,
    Options,
    Data,
} from "vis-network/standalone/esm/vis-network";
import { Move, NodeCore } from "./Logic/IGraphTypes";
import { edge, graph, node } from "./react-graph-vis-types";
import { Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import { useKey } from "rooks";
import { network } from "vis-network";

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
        manipulation: {
            enabled: true,
            addEdge: function (data: { from: any; to: any; }, callback: (arg0: any) => void) {
                console.log('add edge', data);
                callback(data);
                // after each adding you will be back to addEdge mode
                setKeyPressed(false)

                props.network.current.disableEditMode()
                // addEdgeMode();
            }

        },
        // interaction: {
        //     dragView: false,
        //     keyboard: false,
        //     dragNodes: false,
        // },
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
            // color: "#ffffff",
        },
        physics: {
            enabled: false
        }
    });

    const [input, setInput] = useState("")

    const [elements, setElements] = useState<graph>({ edges: [], nodes: [] })

    const [contextMenu, setContextMenu] = React.useState<{ mouseX: any, mouseY: any } | null>(null);

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

    // const [inEdgeMode, setInEdgeMode] = useState(false);
    const [keyPressed, setKeyPressed] = useState<boolean>(false);

    // const enterEdgeMode = (): void => {
    //     if (props.network.current) {
    //         props.network.current.addEdgeMode();
    //     }
    //     setInEdgeMode(true)
    //     // this.setState({inEdgeMode: true});
    // }

    // const leaveEdgeMode = (): void => {
    //     if (props.network.current) {
    //         props.network.current.disableEdgeMode();
    //     }
    //     setInEdgeMode(false)

    // }

    const [cnt, setCnt] = useState(0);


    const [nnnn, setNnnn] = useState<number>(0);

    const handleUserKeyPress = useCallback(event => {
        // const { key, keyCode } = event;
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
        // const { key, keyCode } = event;
        if (event.keyCode === 17) {
            if (keyPressed) {
                console.log('handleUserKeyUnPress')
                props.network.current.disableEditMode();
                setKeyPressed(false);
                console.log('-->' + keyPressed)
            }
        }
    }, [keyPressed]);

    useEffect(() => {
        // props.network.current.addEdgeMode();


        // document.addEventListener("keydown", (event: KeyboardEvent) => {

        // })


        // console.log("XXXXXXXXXXXXXXXXXXXXXXX!!!!")

        // event.key === "Shift"

        // document.addEventListener("keyup", (event: KeyboardEvent) => {
        //     if (event.key === "Shift" && inEdgeMode) {
        //         leaveEdgeMode();
        //     }
        // })

        // window.addEventListener("keydown", async (event: KeyboardEvent) => {
        //     if (event.key === ' ' ) {
        //         console.log('vvvvvvv')
        //         await setKeyPressed(true)
        //         console.log(keyPressed)
        //         // enterEdgeMode()
        //         // leaveEdgeMode();
        //     }

        //     // if ( event.key === 'a' && !inEdgeMode) {
        //     //     // enterEdgeMode();
        //     //     console.log('aaaaaa')

        //     // }
        // })




        // const scrollHandler = (e: KeyboardEvent) => {
        //     setNnnn(nnnn + 1)
        //     console.log(e.code)
        //     console.log(nnnn)
        // }

        // document.addEventListener('keypress', scrollHandler);
        // return () => {
        //     window.removeEventListener("keypress", scrollHandler);
        // }

        // console.log('rmed')

        // window.addEventListener('keydown', downHandler);
        // console.log('oOOOOo')
        // window.addEventListener('keyup', upHandler);
        // return () => {
        //   window.removeEventListener('keydown', downHandler);
        //   window.removeEventListener('keyup', upHandler);
        // };
        // if (!keyPressed) {
        //     document.addEventListener('keydown', onKk)
        //     return () => {
        //         window.removeEventListener('keydown', onKk);
        //         window.removeEventListener('keyup', onKu);
        //     };
        // }
        // if (keyPressed) {
        //     document.addEventListener('keyup', onKu)

        //     return () => {
        //         window.removeEventListener('keydown', onKk);
        //         window.removeEventListener('keyup', onKu);
        //     };
        // }
        
        
        
        window.addEventListener("keydown", handleUserKeyPress);
        window.addEventListener("keyup", handleUserKeyUnPress);
        
        console.log('--' + keyPressed)
        return () => {
            window.removeEventListener("keydown", handleUserKeyPress);
            window.removeEventListener("keyup", handleUserKeyUnPress);
        };
    }, [handleUserKeyPress])


    const onKk = (e: any) => {
        if (e.keyCode === 17) {
            if (!keyPressed) {
                if (props.network.current) {
                    console.log('ENTER-ctrl')
                    setCnt(cnt + 1)
                    setKeyPressed(true)
                    props.network.current.addEdgeMode();
                }
            }
        }
    }


    const onKu = (e: any) => {
        // e = e.event
        if (e.keyCode === 17) {
            if (keyPressed) {
                if (props.network.current) {
                    console.log('exit-ctrl')
                    console.log(cnt)
                    setKeyPressed(false)
                    props.network.current.disableEditMode();
                }
            }
        }
    }

    const [shiftHeld, setShiftHeld] = useState(false);
    function downHandler(key: any) {
        if (key === 'KeyZ') {
            setShiftHeld(true);
        }
    }

    function upHandler(key: any): void {
        if (key === 'KeyZ') {
            setShiftHeld(false);
        }
    }


    // useKey([" "], () => {
    //     if (props.network.current) {
    //         console.log('ENTER')
    //         setKeyPressed(true)
    //         props.network.current.addEdgeMode();
    //     }
    // }, { when: !keyPressed });


    // useKey([" "], () => {
    //     if (props.network.current) {
    //         console.log('exit')
    //         setKeyPressed(false)
    //         props.network.current.disableEditMode();
    //     }
    // }, { when: keyPressed });




    // useKeydown(!keyPressed, ' ', () => {
    //     setNnnn(nnnn + 1)
    //     setKeyPressed(true)
    //     props.network.current.addEdgeMode();
    //     console.log('BB', nnnn, keyPressed)
    // })

    // useKeydown(keyPressed, ' ', () => {
    //     setNnnn(nnnn + 1)
    //     setKeyPressed(false)
    //     props.network.current.disableEdgeMode();
    //     console.log('BB', nnnn, keyPressed)
    // })

    // const clearSelection = () => {
    //     if (props.network.current) {
    //         props.network.current.unselectAll();
    //     }
    // };

    useLayoutEffect(() => {

        if (domNode.current) {
            props.network.current = new Network(domNode.current, props.data, options);
            console.log("HERE<-domNode.current")
        }

        console.log("HERE<-")
        window.addEventListener("contextmenu", e => e.preventDefault());




        // document.addEventListener("keydown", (event) => {
        //     if (props.network.current) {
        //         if (event.ctrlKey) {
        //             props.network.current.addEdgeMode();
        //         }
        //     }
        // })

        // document.addEventListener("keyup", (event) => {
        //     if (props.network.current) {
        //         props.network.current.disableEditMode();
        //     }
        // })

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

            // props.network.current.on('click', () => {
            //     setShowMenu(false)
            // });
            // props.network.current.on('contextmenu', handleContextMenu);
        }


        const scrollHandler = (e: KeyboardEvent) => {
            setNnnn(nnnn + 1)
            console.log(e.code)
            console.log(nnnn)
        }

        return () => window.removeEventListener("keypress", scrollHandler);
    }, [domNode, props.data, props.network, options]);
    // 
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