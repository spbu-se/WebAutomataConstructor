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
import {computersInfo, decorateGraph, elementsToGraph, getNodeNamePrefix, getTransitionsTitles,
    graphToElements, transitionsToLabel} from "./utils";
import RunControl from "./Components/RunControl/RunControl";
import WelcomePopout from "./Components/WelcomePopout/WelcomePopout";
import Paper from "@mui/material/Paper";
import SavingPopout from "./Components/SavingPopout/SavingPopout";
import {Route, Switch, HashRouter} from "react-router-dom";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import PingPage from "./Components/Pages/PingPage/PingPage";
import FailedLoginPage from "./Components/Pages/FailedLoginPage/FailedLoginPage";
import AppHeader from "./Components/AppHeader/AppHeader";
import {TransitionParams} from "./Logic/IGraphTypes";
import SuccessLoginPage from "./Components/Pages/SuccessLoginPage/SuccessLoginPage";
import { Box, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';
import Vis from 'vis'
import { VisNetwork } from './VisNetwork';
import { DFA } from './Logic/DFA';
import {
    DataSet,
    Network,
    Options,
    Data,
} from "vis-network/standalone/esm/vis-network";
import {ContextMenu, MenuItem as CotextMenuItem, ContextMenuTrigger} from "react-contextmenu";

interface appProps {
}

export type Elements = {
    nodes: DataSet<node, "id">,
    edges: DataSet<edge, "id">
}

interface appState {
    computerType: null | ComputerType,
    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean,
    elements: Elements,
    options: any,
    initiallyStabilized: boolean,
    popout: ReactNode | null,
    savePopoutOpen: boolean,
    welcomePopoutOpen: boolean,
    isLogin: boolean,
    mem: string[] | undefined,
    ptr: number | undefined,
}

export const ComputerTypeContext = React.createContext<null | ComputerType>(null);

class App extends React.Component<appProps, appState> {

    memRef = React.createRef<HTMLDivElement>();
    network = React.createRef<Network | null>();
    init = (() => {});
    nfaToDfa = (() => {});
    minimizeDfa = (() => {});


    constructor(props: appProps) {
        super(props);

        this.state = {
            computerType: null,

            selectedNode: null,
            selectedEdge: null,
            inEdgeMode: false,
            elements: {nodes: new DataSet<node>(), edges: new DataSet<edge>()},
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
                    color: "red",
                    heightConstraint: 40
                },
                physics: {
                    enabled: false
                }
            },
            initiallyStabilized: false,
            popout: null,
            savePopoutOpen: false,
            welcomePopoutOpen: false,
            isLogin: true,
            mem: undefined,
            ptr: undefined,
        };
    }

    componentDidMount() {
        this.updateGraph();
        // this.subscribeToShortcuts();
        this.openWelcomePopout();
    }

    // network: any;
    lastNodeId = 0;

////////////////////////////////////////////////////////////////////////////////////////////////////
    // subscribeToShortcuts = () => {
    //     document.addEventListener("keydown", (event: KeyboardEvent) => {
    //         if (event.key === "Shift" && !this.state.inEdgeMode) {
    //             this.enterEdgeMode();
    //         }
    //         if (event.key === "s" && event.ctrlKey) {
    //             event.preventDefault();
    //             this.openSavePopout();
    //         }
    //     })
    //
    //     document.addEventListener("keyup", (event: KeyboardEvent) => {
    //         if (event.key === "Shift" && this.state.inEdgeMode) {
    //             this.leaveEdgeMode();
    //         }
    //     })
    // }

    openSavePopout = () => {
        this.setState({savePopoutOpen: true});
    }

    closeSavePopout = () => {
        this.setState({savePopoutOpen: false});
    }

    openWelcomePopout = () => {
        this.setState({welcomePopoutOpen: true});
    }

    closeWelcomePopout = () => {
        this.setState({welcomePopoutOpen: false});
    }

    login = () => {
        this.setState({isLogin: true});
    }

    logout = () => {
        this.setState({isLogin: false});
    }

    changePopout = (popout: ReactNode | null) => {
        this.setState({popout: popout});
    }


    updateGraph = (): void => {
        decorateGraph(this.state.elements, this.state.computerType)
    }

    changeNodeLabel = (id: number, label: string): void => {
        this.state.elements.nodes.forEach((node) => {
            if (node.id === id) {
                this.state.elements.nodes.update({
                    id: node.id,
                    label: label
                })
            }
        })
        this.updateGraph()
    }


    changeStateIsAdmit = (id: number, isAdmit: boolean): void => {
        this.state.elements.nodes.forEach((node) => {
            if (node.id === id) {
                this.state.elements.nodes.update({
                    id: node.id,
                    isAdmit: isAdmit
                })
            }
        })
        this.updateGraph()
    }

    changeStateIsInitial = (id: number, isInitial: boolean): void => {
        this.state.elements.nodes.forEach((node) => {
            // if (node.isInitial) {
            //     this.state.elements.nodes.update({
            //         id: node.id,
            //         isInitial: false
            //     })
            // }
            if (node.id === id) {
                this.state.elements.nodes.update({
                    id: node.id,
                    isInitial: isInitial
                })
            }
        })
        this.updateGraph()
    }


    changeStateIsCurrent = (ids: number[], isCurrent: boolean): void => {
        this.state.elements.nodes.forEach((node) => {
            if (node.isCurrent) {
                this.state.elements.nodes.update({
                    id: node.id,
                    isCurrent: false
                })
            }
        })
        this.state.elements.nodes.forEach((node) => {
            if (ids.includes(node.id)) {
                this.state.elements.nodes.update({
                    id: node.id,
                    isCurrent: isCurrent
                })
            }
        })
        this.updateGraph()
    }

    createNode = (e: { pointer: { canvas: { x: any; y: any; }; }; }) => {
        this.lastNodeId++;
        const node = {
            id: this.lastNodeId,
            label: 'S' + (this.lastNodeId),
            x: e.pointer.canvas.x,
            y: e.pointer.canvas.y,
            isAdmit: false,
            isInitial: false,
            isCurrent: false,
            // color: id === 1 ? { border: '#6984ff', background: '#ffffff' } : { border: '#000000', background: '#ffffff' }
        }
        this.state.elements.nodes.add(node);
        // this.updateGraph()
    }

    selectNode = (e: { nodes: number[]; }): void => {
        const nodesIDs: number[] = e.nodes;
        const selectedNodes = this.state.elements.nodes.get(nodesIDs);
        this.setState({selectedNode: selectedNodes[0]});
    }


    deselectNode = (e: { nodes: number[]; }): void => {
        const nodesIDs: number[] = e.nodes;
        if (nodesIDs.length === 0) {
            this.setState({selectedNode: null});
        }
    }

    deleteNode = (id: number): void => {
        this.state.elements.nodes.remove(id)

        let rmEdges: string[] = []
        this.state.elements.edges.forEach((edge) => {
            if (edge.from === id || edge.to === id) {
                rmEdges.push(edge.id!)
            }
        })
        this.state.elements.edges.remove(rmEdges)
        // this.updateGraph()
    }

    selectEdge = (e: { edges: any; }): void => {
        const edgesIDs: number[] = e.edges;
        const selectedEdges = this.state.elements.edges.get(edgesIDs);
        this.setState({selectedEdge: selectedEdges[0]});
    }

    deselectEdge = (e: { edges: number[]; }): void => {
        const edgesIDs: number[] = e.edges;
        if (edgesIDs.length === 0) {
            this.setState({selectedEdge: null});
        }
    }


    changeEdgeTransition = (id: string, transitions: Set<TransitionParams[]>): void => {
        this.state.elements.edges.update({
            id: id,
            label: transitionsToLabel(transitions, this.state.computerType),
            transitions: transitions
        })
        // this.updateGraph()
    }



    deleteEdge = (id: string): void => {
        this.state.elements.edges.remove(id)
    }

    updMem = (mem: string[], ptr: number): void => {
        this.setState({ mem: mem, ptr: ptr });
    }

    memPos = (index: number | undefined): void => {
        // if (index !== undefined && index > 5) {
        this.memRef?.current?.scrollIntoView({behavior: 'smooth'})
        // }
    }

    // graphToElements = (graph: graph): Elements => {
    //     let acc: Elements = {nodes: new DataSet<node, "id">(), edges: new DataSet<edge, "id">()}
    //
    //     graph.nodes.forEach((node) => {
    //         acc.nodes.add(node)
    //     })
    //     graph.edges.forEach((edge) => {
    //         acc.edges.add(edge)
    //     })
    //
    //     return acc
    // }

    handleClick = (e: any, data: { item: any; }) => {
        alert(`Clicked on menu ${data.item}`);
    };


    ContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.nfaToDfa}
                    >
                        {"НКА->ДКА"}
                    </button>
                </div>
            </div>
        )
    }


    DFAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.minimizeDfa}
                    >
                        {"Минимизровать"}
                    </button>
                </div>
            </div>
        )
    }

    AnotherContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                    >
                        {"Just-button"}
                    </button>
                </div>
            </div>
        )
    }



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
                    <Route path="/success-login">
                        <SuccessLoginPage onAuthSuccess={this.login}/>
                    </Route>
                    <Route path="/">
                        <ComputerTypeContext.Provider value={this.state.computerType}>
                            <div className="app">
                                <WelcomePopout
                                    open={this.state.welcomePopoutOpen}
                                    onClose={this.closeWelcomePopout}
                                    onAuthFailed={this.logout}
                                    changeComputerType={(computerType, graph: graph | null) => {

                                        const defaultGraph = graph || computersInfo[computerType!].defaultGraph;

                                        console.log(defaultGraph);
                                        console.log(defaultGraph["nodes"]);
                                        console.log("defaultGraph");
                                        graphToElements(defaultGraph).nodes.forEach((v) => console.log(v))

                                        this.lastNodeId = defaultGraph.nodes.length;
                                        this.setState({
                                            computerType: computerType,
                                            elements: graphToElements(defaultGraph)
                                        }
                                        , () => this.updateGraph()
                                        );
                                    }}
                                />

                                {this.state.popout}

                                <SavingPopout open={this.state.savePopoutOpen}
                                              onClose={this.closeSavePopout}
                                              isLogin={this.state.isLogin}
                                              onAuthFailed={this.logout}
                                              graph={elementsToGraph    (this.state.elements)}
                                              computerType={this.state.computerType!}/>

                                <div className="hint-container">
                                    <Paper className="hint" variant="outlined">
                                        Ctrl+S — сохранить автомат
                                    </Paper>
                                    <Paper className="hint" variant="outlined">
                                        Удерживайте Ctrl чтобы создать ребро
                                    </Paper>
                                    <Paper className="hint" variant="outlined">
                                        Двойное нажатие чтобы создать вершину
                                    </Paper>
                                </div>


                                {
                                    this.state.computerType === "tm" ?
                                        <div className="app__mem_ribbon">
                                            {
                                                this.state.mem?.map((value, index) =>
                                                    <div
                                                        className="app__mem_cell"
                                                        style={{border: `${index === this.state.ptr ? "#0041d0" : "#000000" } 2px solid`}}
                                                    >
                                                        {Math.abs (Math.abs(index) - Math.abs(this.state.ptr!)) <= 5  ? <div ref={this.memRef}/> : <div/>}
                                                        {value}
                                                        {this.memRef?.current?.scrollIntoView({behavior: 'smooth'})}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        : <div/>
                                }


                                <AppHeader
                                    onMenuButtonClicked={this.openWelcomePopout}
                                    onSaveButtonClicked={this.openSavePopout}
                                    onLogoutButtonClicked={this.logout}
                                    isLogin={this.state.isLogin}
                                />


                                <div className="field__container">
                                    {
                                        this.state.computerType === "nfa"|| this.state.computerType === "nfa-eps"
                                            ?
                                            <VisNetwork
                                                nodes={this.state.elements.nodes}
                                                edges={this.state.elements.edges}
                                                data={this.state.elements}
                                                onDoubleClick={this.createNode}
                                                onClick1={this.selectEdge}
                                                onClick2={this.selectNode}
                                                onClick3={this.deselectNode}
                                                onClick4={this.deselectEdge}
                                                network={this.network}
                                                contextMenu={this.ContextMenu}
                                            />
                                            :
                                            this.state.computerType === "dfa"
                                                ?
                                                <VisNetwork
                                                    nodes={this.state.elements.nodes}
                                                    edges={this.state.elements.edges}
                                                    data={this.state.elements}
                                                    onDoubleClick={this.createNode}
                                                    onClick1={this.selectEdge}
                                                    onClick2={this.selectNode}
                                                    onClick3={this.deselectNode}
                                                    onClick4={this.deselectEdge}
                                                    network={this.network}
                                                    contextMenu={this.DFAContextMenu}
                                                />
                                                :
                                            <VisNetwork
                                                nodes={this.state.elements.nodes}
                                                edges={this.state.elements.edges}
                                                data={this.state.elements}
                                                onDoubleClick={this.createNode}
                                                onClick1={this.selectEdge}
                                                onClick2={this.selectNode}
                                                onClick3={this.deselectNode}
                                                onClick4={this.deselectEdge}
                                                network={this.network}
                                                contextMenu={this.AnotherContextMenu}

                                            />
                                    }
                                </div>





                                {/*<div className="hight">Right Click for Open Menu</div>*/}




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
                                        computerType={this.state.computerType}
                                        reinitComputer={this.init}
                                    />
                                    <RunControl
                                        updMem={this.updMem}
                                        elements={this.state.elements}
                                        changeStateIsCurrent={this.changeStateIsCurrent}
                                        network={this.network}
                                        setInit={(f: () => void) => this.init = f}
                                        setNfaToDfa={(f: () => void) => this.nfaToDfa = f}
                                        setMinimizeDfa={(f: () => void) => this.minimizeDfa = f}
                                        updateElements={(elements: Elements) => this.setState({elements: elements}, () => this.updateGraph())}
                                        setComputerType={(type: null | ComputerType) => this.setState({computerType: type})}
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