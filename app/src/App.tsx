import React, {ReactNode} from 'react';
import "./App.css"
import Graph from "react-graph-vis";
import {
    ComputerType,
    controlNodeDraggingEventArgs, deselectEdgeEventArgs,
    deselectNodeEventArgs,
    doubleClickEventArgs, dragEndEventArgs, edge,
    graph,
    node, selectEdgeEventArgs,
    selectNodeEventArgs
} from "./react-graph-vis-types";
import {cloneDeep} from "lodash";
import NodeControl from "./Components/NodeControl/NodeControl";
import EdgeControl from "./Components/EdgeControl/EdgeControl";
import {computersInfo, decorateGraph, getNodeNamePrefix, transitionsToLabel} from "./utils";
import RunControl from "./Components/RunControl/RunControl";
import ComputerTypePopout from "./Components/ComputerTypePopout/ComputerTypePopout";
import Paper from "@mui/material/Paper";
import SavingPopout from "./Components/SavingPopout/SavingPopout";
import {Route, Switch, HashRouter} from "react-router-dom";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import PingPage from "./Components/Pages/PingPage/PingPage";
import FailedLoginPage from "./Components/Pages/FailedLoginPage/FailedLoginPage";
import AppHeader from "./Components/AppHeader/AppHeader";

interface appProps {
}

interface appState {
    computerType: null | ComputerType

    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean,
    elements: graph,
    options: any,
    initiallyStabilized: boolean,
    popout: ReactNode | null,
    savePopoutOpen: boolean,
}

export const ComputerTypeContext = React.createContext<null | ComputerType>(null);

class App extends React.Component<appProps, appState> {
    constructor(props: appProps) {
        super(props);

        this.state = {
            computerType: null,

            selectedNode: null,
            selectedEdge: null,
            inEdgeMode: false,
            elements: {nodes: [], edges: []},
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
                    shape: "box",
                    font: "18px Roboto black",
                    labelHighlightBold: false,
                    widthConstraint: 40,
                    heightConstraint: 40
                },
                physics: {
                    enabled: false
                }
            },
            initiallyStabilized: false,
            popout: null,
            savePopoutOpen: false,
        };
    }

    componentDidMount() {
        this.updateGraph();
        this.subscribeToShortcuts();
    }

    network: any;
    lastNodeId = 0;

    subscribeToShortcuts = () => {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Shift" && !this.state.inEdgeMode) {
                this.enterEdgeMode();
            }
            if (event.key === "s" && event.ctrlKey) {
                event.preventDefault();
                this.openSavePopout();
            }
        })

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.key === "Shift" && this.state.inEdgeMode) {
                this.leaveEdgeMode();
            }
        })
    }

    openSavePopout = () => {
        this.setState({savePopoutOpen: true});
    }

    closeSavePopout = () => {
        this.setState({savePopoutOpen: false});
    }

    changePopout = (popout: ReactNode | null) => {
        this.setState({popout: popout});
    }

    getNodeById = (id: number): node | undefined => {
        return this.state.elements.nodes.find(node => node.id === id);
    }

    getEdgeById = (id: string): edge | undefined => {
        return this.state.elements.edges.find(edge => edge.id === id);
    }

    updateGraph = (): void => {
        if (this.network) {
            this.network.setData(decorateGraph(this.state.elements));
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
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeStateIsInitial = (id: number, isInitial: boolean): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].isInitial) {
                elements.nodes[i].isInitial = false;
            }

            if (elements.nodes[i].id === id) {
                elements.nodes[i].isInitial = isInitial
            }
        }

        this.setState({elements: elements}, () => this.updateGraph());
    }

    changeStateIsCurrent = (ids: number[], isCurrent: boolean): void => {
        const elements = cloneDeep(this.state.elements);

        for (let i = 0; i < elements.nodes.length; i++) {
            if (elements.nodes[i].isCurrent) {
                elements.nodes[i].isCurrent = false;
            }
        }

        for (let i = 0; i < elements.nodes.length; i++) {
            if (ids.includes(elements.nodes[i].id)) {
                elements.nodes[i].isCurrent = isCurrent
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

        elements.nodes.push({
            id: ++this.lastNodeId,
            x: x,
            y: y,
            label: getNodeNamePrefix(this.state.elements),
            isAdmit: false,
            isInitial: false
        });

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
            <HashRouter>
                <Switch>
                    <Route path="/login">
                        <LoginPage/>
                    </Route>
                    <Route path="/ping">
                        <PingPage/>
                    </Route>
                    <Route path="/failed-login">
                        <FailedLoginPage/>
                    </Route>
                    <Route path="/">
                        <ComputerTypeContext.Provider value={this.state.computerType}>
                            <div className="app">
                                {
                                    this.state.computerType === null ?
                                        <ComputerTypePopout
                                            changeComputerType={(computerType, graph: graph | null) => {

                                                const defaultGraph = graph || computersInfo[computerType!].defaultGraph;

                                                console.log(defaultGraph);
                                                console.log(defaultGraph["nodes"]);

                                                this.lastNodeId = defaultGraph.nodes.length;
                                                this.setState({
                                                    computerType: computerType,
                                                    elements: defaultGraph
                                                }, () => this.updateGraph());
                                            }}
                                        />
                                        : null
                                }

                                {this.state.popout}

                                <SavingPopout open={this.state.savePopoutOpen}
                                              onClose={this.closeSavePopout}
                                              graph={this.state.elements}
                                              computerType={this.state.computerType!}/>

                                <div className="hint-container">
                                    <Paper className="hint" variant="outlined">
                                        Ctrl+S — сохранить автомат
                                    </Paper>
                                    <Paper className="hint" variant="outlined">
                                        Удерживайте Shift чтобы создать ребро
                                    </Paper>
                                    <Paper className="hint" variant="outlined">
                                        Двойное нажатие чтобы создать вершину
                                    </Paper>
                                </div>

                                <AppHeader
                                    onMenuButtonClicked={() => this.setState({computerType: null})}
                                    onSaveButtonClicked={this.openSavePopout}
                                />

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
                                    <EdgeControl
                                        edge={this.state.selectedEdge}
                                        changeEdgeTransitions={this.changeEdgeTransition}
                                        deleteEdge={this.deleteEdge}
                                    />
                                    <RunControl
                                        elements={this.state.elements}
                                        changeStateIsCurrent={this.changeStateIsCurrent}
                                    />
                                </div>

                            </div>
                        </ComputerTypeContext.Provider>
                    </Route>
                </Switch>
            </HashRouter>

        )
    }
}

export default App;