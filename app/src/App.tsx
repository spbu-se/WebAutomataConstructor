import React from 'react';
import "./App.css"
import Graph from "react-graph-vis";
import {
    controlNodeDraggingEventArgs,
    deselectNodeEventArgs,
    doubleClickEventArgs,
    graph,
    node,
    selectNodeEventArgs
} from "react-graph-vis-types";
import cloneDeep from "lodash/cloneDeep";
import NodeControl from "./Components/NodeControl/NodeControl";
import SettingsControl from "./Components/SettingsControl/SettingsControl";

interface appProps {
}

interface appState {
    elements: graph,
    selectedNode: node | null,
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
        {from: 1, to: 2, label: "0"},
        {from: 2, to: 1, label: "0"},
        {from: 3, to: 4, label: "0"},
        {from: 4, to: 4, label: "0"},
        {from: 1, to: 3, label: "1"},
        {from: 2, to: 4, label: "1"},
        {from: 3, to: 2, label: "1"},
        {from: 4, to: 2, label: "kek"},
    ]
}

class App extends React.Component<appProps, appState> {
    constructor(props: appProps) {
        super(props);

        this.state = {
            elements: initialElements,
            selectedNode: null,
            inEdgeMode: false
        };
    }

    network: any;
    lastNodeId = initialElements.nodes.length;

    getNodeById = (id: number): node | undefined => {
        return this.state.elements.nodes.find(node => node.id === id);
    }

    changeNodeLabel = (id: number, label: string): void => {
        const elements = cloneDeep(this.state.elements);

        for(let i = 0; i < elements.nodes.length; i++) {
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

        this.setState({elements: elements});
    }

    addEdge = (from: number, to: number): void => {
        const elements = cloneDeep(this.state.elements);

        elements.edges.push({from: from, to: to});

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

    options = {};

    events = {
        doubleClick: this.createNode,
        selectNode: this.selectNode,
        deselectNode: this.deselectNode,
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
                </div>

            </div>
        )
    }
}

export default App;