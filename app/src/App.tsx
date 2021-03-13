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
} from "./react-graph-vis-types";
import NodeControl from "./Components/NodeControl/NodeControl";
import SettingsControl from "./Components/SettingsControl/SettingsControl";
import EdgeControl from "./Components/EdgeControl/EdgeControl";
import {getStateColor, transitionsToLabel} from "./utils";

interface appProps {
}

interface appState {
    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean
}

const initialElements: graph = {
    nodes: [
        {id: 1, label: "label 1", isAdmit: false, isInitial: true, color: getStateColor(false, true)},
        {id: 2, label: "label 2", isAdmit: false, isInitial: false, color: getStateColor(false, false)},
        {id: 3, label: "label 3", isAdmit: true, isInitial: false, color: getStateColor(true, false)},
        {id: 4, label: "label 4", isAdmit: true, isInitial: false, color: getStateColor(true, false)},
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
            selectedNode: null,
            selectedEdge: null,
            inEdgeMode: false
        };
    }

    componentDidMount() {
        this.updateGraph()
    }

    elements: graph = initialElements;
    network: any;
    lastNodeId = initialElements.nodes.length;

    getNodeById = (id: number): node | undefined => {
        return this.elements.nodes.find(node => node.id === id);
    }

    getEdgeById = (id: string): edge | undefined => {
        return this.elements.edges.find(edge => edge.id === id);
    }

    updateGraph = (): void => {
        if (this.network !== null) {
            this.network.setData(this.elements);
        }
    }

    changeNodeLabel = (id: number, label: string): void => {
        for (let i = 0; i < this.elements.nodes.length; i++) {
            if (this.elements.nodes[i].id === id) {
                this.elements.nodes[i].label = label;
            }
        }

        this.updateGraph();
    }

    changeStateIsAdmit = (id: number, isAdmit: boolean): void => {
        for (let i = 0; i < this.elements.nodes.length; i++) {
            if (this.elements.nodes[i].id === id) {
                this.elements.nodes[i].isAdmit = isAdmit;
                this.elements.nodes[i].color = getStateColor(isAdmit, this.elements.nodes[i].isInitial);
            }
        }

        this.updateGraph();
    }

    changeStateIsInitial = (id: number, isInitial: boolean): void => {
        for (let i = 0; i < this.elements.nodes.length; i++) {
            if (this.elements.nodes[i].isInitial) {
                this.elements.nodes[i].isInitial = false;
                this.elements.nodes[i].color = getStateColor(this.elements.nodes[i].isAdmit, false);
            }

            if (this.elements.nodes[i].id === id) {
                this.elements.nodes[i].isInitial = isInitial
                this.elements.nodes[i].color = getStateColor(this.elements.nodes[i].isAdmit, isInitial);
            }
        }

        this.updateGraph();
    }

    createNode = (args: doubleClickEventArgs): void => {
        const x = args.pointer.canvas.x;
        const y = args.pointer.canvas.y;

        this.elements.nodes.push({id: ++this.lastNodeId, label: "new", isAdmit: false, isInitial: false});

        this.updateGraph();
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
        for (let i = 0; i < this.elements.nodes.length; i++) {
            if (this.elements.nodes[i].id === id) {
                this.elements.nodes.splice(i, 1);
                break;
            }
        }

        for (let i = 0; i < this.elements.edges.length; i++) {
            if (this.elements.edges[i].from === id ||
                this.elements.edges[i].to === id) {
                this.elements.edges.splice(i, 1);
                i--;
            }
        }

        this.setState({selectedNode: null});
        this.updateGraph();
    }

    addEdge = (from: number, to: number): void => {
        this.elements.edges.push({from: from, to: to, label: "", transitions: new Set()});

        this.updateGraph();
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
            this.setState({selectedEdge: this.getEdgeById(args.edges[0])!});
        }
    }

    deselectEdge = (args: deselectEdgeEventArgs): void => {
        if (args.edges.length === 0) {
            this.setState({selectedEdge: null});
        }
    }

    changeEdgeLabel = (id: string, label: string): void => {
        for (let i = 0; i < this.elements.edges.length; i++) {
            if (this.elements.edges[i].id === id) {
                this.elements.edges[i].label = label;
            }
        }

        this.updateGraph();
    }

    changeEdgeTransition = (id: string, transitions: Set<string>): void => {
        for (let i = 0; i < this.elements.edges.length; i++) {
            if (this.elements.edges[i].id === id) {
                this.elements.edges[i].transitions = transitions;
                this.elements.edges[i].label = transitionsToLabel(transitions);
            }
        }

        this.updateGraph();
    }

    deleteEdge = (id: string): void => {
        for (let i = 0; i < this.elements.edges.length; i++) {
            if (this.elements.edges[i].id === id) {
                this.elements.edges.splice(i, 1);
                break;
            }
        }

        this.setState({selectedEdge: null});
        this.updateGraph();
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
                        graph={{nodes: [], edges: []}}
                        options={this.options}
                        events={this.events}
                    />
                </div>

                <div className="app__right-menu">
                    <NodeControl
                        node={this.state.selectedNode}
                        changeNodeLabel={this.changeNodeLabel}
                        changeStateIsAdmit={this.changeStateIsAdmit}
                        changeStateIsInitial={this.changeStateIsInitial}
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