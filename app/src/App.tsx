import React from 'react';
import "./App.css"
import Graph from "react-graph-vis";
import {
    controlNodeDraggingEventArgs, deselectEdgeEventArgs,
    deselectNodeEventArgs,
    doubleClickEventArgs, dragEndEventArgs, edge,
    graph,
    node, selectEdgeEventArgs,
    selectNodeEventArgs
} from "./react-graph-vis-types";
import { cloneDeep } from "lodash";
import NodeControl from "./Components/NodeControl/NodeControl";
import SettingsControl from "./Components/SettingsControl/SettingsControl";
import EdgeControl from "./Components/EdgeControl/EdgeControl";
import {getStateColor, transitionsToLabel} from "./utils";
import RunControl from "./Components/RunControl/RunControl";

interface appProps {
}

interface appState {
    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean,
    elements: graph,
    options: any,
    initiallyStabilized: boolean
}

const initialElements: graph = {
    nodes: [
        {id: 1, x: 0, y: 20, label: "label 1", isAdmit: false, isInitial: true, isCurrent: false, color: getStateColor(false, true, false)},
        {id: 2, x: 200, y: 0, label: "label 2", isAdmit: false, isInitial: false, isCurrent: false, color: getStateColor(false, false, false)},
        {id: 3, x: 0, y: 180, label: "label 3", isAdmit: true, isInitial: false, isCurrent: false, color: getStateColor(true, false, false)},
        {id: 4, x: 180, y: 200, label: "label 4", isAdmit: true, isInitial: false, isCurrent: false, color: getStateColor(true, false, false)},
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
            inEdgeMode: false,
            elements: initialElements,
            options: {
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
                },
                physics: {
                    enabled: false
                }
            },
            initiallyStabilized: false
        };
    }

    componentDidMount() {
        this.updateGraph();
    }

    network: any;
    lastNodeId = initialElements.nodes.length;

    getNodeById = (id: number): node | undefined => {
        return this.state.elements.nodes.find(node => node.id === id);
    }

    getEdgeById = (id: string): edge | undefined => {
        return this.state.elements.edges.find(edge => edge.id === id);
    }

    updateGraph = (): void => {
        if (this.network !== null) {
            this.network.setData(this.state.elements);
        }
    }

    changeNodeLabel = (id: number, label: string): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].id === id) {
                elements.nodes[i].label = label;
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeStateIsAdmit = (id: number, isAdmit: boolean): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].id === id) {
                elements.nodes[i].isAdmit = isAdmit;
                elements.nodes[i].color = getStateColor(isAdmit, elements.nodes[i].isInitial, elements.nodes[i].isCurrent);
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeStateIsInitial = (id: number, isInitial: boolean): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].isInitial) {
                elements.nodes[i].isInitial = false;
                elements.nodes[i].color = getStateColor(elements.nodes[i].isAdmit, false, elements.nodes[i].isCurrent);
            }

            if (elements.nodes[i].id === id) {
                elements.nodes[i].isInitial = isInitial
                elements.nodes[i].color = getStateColor(elements.nodes[i].isAdmit, isInitial, elements.nodes[i].isCurrent);
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeStateIsCurrent = (id: number, isCurrent: boolean): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].isCurrent) {
                elements.nodes[i].isCurrent = false;
                elements.nodes[i].color = getStateColor(elements.nodes[i].isAdmit, elements.nodes[i].isInitial, false);
            }

            if (elements.nodes[i].id === id) {
                elements.nodes[i].isCurrent = isCurrent
                elements.nodes[i].color = getStateColor(elements.nodes[i].isAdmit, elements.nodes[i].isInitial, isCurrent);
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeNodePosition = (id: number, x: number, y: number): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].id === id) {
                elements.nodes[i].x = x;
                elements.nodes[i].y = y;
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    createNode = (args: doubleClickEventArgs): void => {
        const x = args.pointer.canvas.x;
        const y = args.pointer.canvas.y;

        const elements = cloneDeep(this.state.elements);

        elements.nodes.push({id: ++this.lastNodeId, label: "new", isAdmit: false, isInitial: false});

        this.setState({elements: elements}, () => this.updateGraph());
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

        this.setState({selectedNode: null});
        this.setState({elements: elements}, () => this.updateGraph());
    }

    addEdge = (from: number, to: number): void => {
        const elements = cloneDeep(this.state.elements);

        elements.edges.push({from: from, to: to, label: "", transitions: new Set()});

        this.setState({elements: elements}, () => this.updateGraph());
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
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges[i].label = label;
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeEdgeTransition = (id: string, transitions: Set<string>): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges[i].transitions = transitions;
                elements.edges[i].label = transitionsToLabel(transitions);
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    deleteEdge = (id: string): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.edges.length; i++) {
            if (elements.edges[i].id === id) {
                elements.edges.splice(i, 1);
                break;
            }
        }

        this.setState({selectedEdge: null});
        this.setState({elements: elements}, () => this.updateGraph());
    }


    onDragEnd = (args: dragEndEventArgs): void => {
        if (args.nodes.length === 1) {
            const node = args.nodes[0];
            const {x, y} = args.pointer.canvas;

            this.changeNodePosition(node, x, y);
        }
    }

    events = {
        doubleClick: this.createNode,
        selectNode: this.selectNode,
        selectEdge: this.selectEdge,
        deselectNode: this.deselectNode,
        deselectEdge: this.deselectEdge,
        controlNodeDragEnd: this.onEdgeDragEnd,
        dragEnd: this.onDragEnd
    };

    render() {
        return (
            <div className="app">
                <div className="field__container">
                    <Graph
                        getNetwork={(network: any) => this.network = network}
                        graph={{nodes: [], edges: []}}
                        options={this.state.options}
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
                    <RunControl
                        elements={this.state.elements}
                        changeStateIsCurrent={this.changeStateIsCurrent}
                    />
                </div>

            </div>
        )
    }
}

export default App;