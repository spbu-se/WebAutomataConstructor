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


export interface Iedge {
    id: number, from: number, to: number, label: string
}

export interface NodeCore0  {
    id: number
    isAdmit: boolean
    stack?: string[]
    move?: Move
}

export interface node0 extends NodeCore{
    label: string,
    isInitial: boolean,
    isCurrent: boolean,
    x?: number,
    y?: number,
    color?: { border: string, background: string },
}

export const VisNetwork = (props: { txt: string, nodes: DataSet<node>, edges: DataSet<Iedge>, data: {nodes: DataSet<node, "id">, edges: DataSet<Iedge, "id">}, onDoubleClick: (params?: any) => void, onKeyDown: (params?: any) => void }) => {
    // A reference to the div rendered by this component
    const [domNode, setdomNode] = useState(useRef<HTMLDivElement>(null));

    // A reference to the vis network instance
    const [network, setNetwork] = useState(useRef<Network | null>(null));

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
        nodes: {
            shape: "circle",
            font: "18px Roboto black",
            labelHighlightBold: false,
            size: 40,
            borderWidth : 2,
            // color: "#ffffff",
        },
        physics: {
            enabled: false
        }
    });

    const [input, setInput] = useState("")

    const[elements, setElements] = useState<graph>({ edges: [], nodes: [] })

    useEffect ( () => {

        elements.edges.forEach(edge => {
            console.log(edge.from, edge.to, edge.label)
        })
        console.log()


    }, [elements])

    useLayoutEffect(() => {

        if (domNode.current) {
            network.current = new Network(domNode.current, props.data, options);
        }

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (network.current) {
                if (event.key === "Delete") {
                    network.current.deleteSelected();
                }
            }
        })

        document.addEventListener("keydown", (event) => {
            if (network.current) {
                if (event.ctrlKey) {
                    network.current.addEdgeMode();
                }
            }
        })

        document.addEventListener("keyup", (event) => {
            if (network.current) {
                network.current.disableEditMode();
            }
        })

        if (network.current) {
            network.current.on('doubleClick', props.onDoubleClick)
            network.current.on('click', props.onKeyDown);
        }

    }, [domNode, network, props.data, options]);

    return (
        <div
            style={{
                height: "50%",
                width: "100%",
            }}
            ref={domNode}
        />

    );
};