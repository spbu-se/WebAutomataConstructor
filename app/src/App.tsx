import React from 'react';
import "./App.css"
import Graph from "react-graph-vis";
import {
    controlNodeDraggingEventArgs, deselectEdgeEventArgs,
    deselectNodeEventArgs,
    doubleClickEventArgs, edge,
    graph,
    node, selectEdgeEventArgs,
    selectNodeEventArgs
} from "react-graph-vis-types";
import cloneDeep from "lodash/cloneDeep";
import NodeControl from "./Components/NodeControl/NodeControl";
import SettingsControl from "./Components/SettingsControl/SettingsControl";
import EdgeControl from "./Components/EdgeControl/EdgeControl";
import {transitionsToLabel} from "./utils";

interface appProps {
}

interface appState {
    elements: graph,
    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean
}

const initialElements: graph = {
    nodes: [
        {id: 1, label: "label 1"},
        {id: 2, label: "label 2"},
        {id: 3, label: "label 3"},
        {id: 4, label: "label 4"},
    ],
    edges: [
        {from: 1, to: 2, label: "0", transitions: new Set(["0"])},
        {from: 2, to: 1, label: "0", transitions: new Set(["0"])},
        {from: 3, to: 4, label: "0", transitions: new Set(["0"])},
        {from: 4, to: 4, label: "0", transitions: new Set(["0"])},
        {from: 1, to: 3, label: "1", transitions: new Set(["1"])},
        {from: 2, to: 4, label: "1", transitions: new Set(["1"])},
        {from: 3, to: 2, label: "1", transitions: new Set(["1"])},
        {from: 4, to: 2, label: "1", transitions: new Set(["1"])},
    ]
}

class App extends React.Component<appProps, appState> {
    constructor(props: appProps) {
        super(props);

        this.state = {
            elements: initialElements,
            selectedNode: null,
            selectedEdge: null,
            inEdgeMode: false
        };
    }

    network: any;
    lastNodeId = initialElements.nodes.length;

    getNodeById = (id: number): node | undefined => {
        return this.state.elements.nodes.find(node => node.id === id);
    }

    getEdgeById = (id: string): edge | undefined => {
        return this.state.elements.edges.find(edge => edge.id === id);
    }

    changeNodeLabel = (id: number, label: string): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].id === id) {
                elements.nodes[i].label = label;
            }
        }

        this.setState({elements: elements});
    }

    createNode = (args: doubleClickEventArgs): void => {
        const x = args.pointer.canvas.x;
        const y = args.pointer.canvas.y;

        const elements = cloneDeep(this.state.elements);

        elements.nodes.push({id: ++this.lastNodeId, label: "new"});

        this.setState({elements: elements});
    }

    selectNode = (args: selectNodeEventArgs): void => {
        if (args.nodes.length > 0) {
            this.setState({selectedNode: this.getNodeById(args.nodes[0])!});
        }
    }

    deselectNode = (args: deselectNodeEventArgs): void => {
        if (args.nodes.length === 0) {
            this.setState({selectedNode: null});
        }
    }

    deleteNode = (id: number): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].id === id) {
                elements.nodes.splice(i, 1);
                break;
            }
        }

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].from === id ||
                elements.edges[i].to === id) {
                elements.edges.splice(i, 1);
                i--;
            }
        }

        this.setState({elements: elements, selectedNode: null});
    }

    addEdge = (from: number, to: number): void => {
        const elements = cloneDeep(this.state.elements);

        const edge: edge = {from: from, to: to, label: "", transitions: new Set()};
        elements.edges.push(edge);

        this.setState({elements: elements});
    }

    enterEdgeMode = (): void => {
        this.network.addEdgeMode();
        this.setState({inEdgeMode: true});
    }

    leaveEdgeMode = (): void => {
        this.network.disableEditMode();
        this.setState({inEdgeMode: false});
    }

    onEdgeDragEnd = (args: controlNodeDraggingEventArgs): void => {
        if (args.controlEdge.to !== undefined) {
            this.addEdge(args.controlEdge.from, args.controlEdge.to);
            this.leaveEdgeMode();
        }
    }

    selectEdge = (args: selectEdgeEventArgs): void => {
        if (args.edges.length === 1) {
            this.setState({selectedEdge: this.getEdgeById(args.edges[0])!}, () => console.log(this.state.selectedEdge));
        }
    }

    deselectEdge = (args: deselectEdgeEventArgs): void => {
        if (args.edges.length === 0) {
            this.setState({selectedEdge: null});
        }
    }

    changeEdgeLabel = (id: string, label: string): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges[i].label = label;
            }
        }

        this.setState({elements: elements});
    }

    changeEdgeTransition = (id: string, transitions: Set<string>): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges[i].transitions = transitions;
                elements.edges[i].label = transitionsToLabel(transitions);
            }
        }

        this.setState({elements: elements});
    }

    deleteEdge = (id: string): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges.splice(i, 1);
                break;
            }
        }

        this.setState({elements: elements, selectedEdge: null});
    }

    options = {
        edges: {
            smooth: {
                enabled: true,
                type: "discrete",
                roundness: 0.5
            },
            length: 200
        },
        nodes: {
            shape: "circle",
            color: {
                border: "black",
                background: "white"
            }
        }
    };

    events = {
        doubleClick: this.createNode,
        selectNode: this.selectNode,
        selectEdge: this.selectEdge,
        deselectNode: this.deselectNode,
        deselectEdge: this.deselectEdge,
        controlNodeDragEnd: this.onEdgeDragEnd
    };

    render() {
        return (
            <div className="app">
                <div className="field__container">
                    <Graph
                        getNetwork={(network: any) => this.network = network}
                        graph={this.state.elements}
                        options={this.options}
                        events={this.events}
                    />
                </div>

                <div className="app__right-menu">
                    <NodeControl
                        node={this.state.selectedNode}
                        changeNodeLabel={this.changeNodeLabel}
                        deleteNode={this.deleteNode}
                    />
                    <SettingsControl
                        enterEdgeMode={this.enterEdgeMode}
                        leaveEdgeMode={this.leaveEdgeMode}
                        inEdgeMode={this.state.inEdgeMode}
                    />
                    <EdgeControl
                        edge={this.state.selectedEdge}
                        changeEdgeLabel={this.changeEdgeLabel}
                        changeEdgeTransitions={this.changeEdgeTransition}
                        deleteEdge={this.deleteEdge}
                    />
                </div>

            </div>
        )
    }
}

export default App;