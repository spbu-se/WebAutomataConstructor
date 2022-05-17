import React, { ReactNode } from 'react';
import "./App.css"
import {
    ComputerType,
    edge,
    graph,
    histNode,
    node
} from "./react-graph-vis-types";
import NodeControl from "./Components/NodeControl/NodeControl";
import EdgeControl from "./Components/EdgeControl/EdgeControl";
import {
    computersInfo, decorateGraph, elementsToGraph, getNodeNamePrefix, getTransitionsTitles,
    graphToElements, transitionsToLabel
} from "./utils";
import RunControl from "./Components/RunControl/RunControl";
import WelcomePopout from "./Components/WelcomePopout/WelcomePopout";
import Paper from "@mui/material/Paper";
import SavingPopout from "./Components/SavingPopout/SavingPopout";
import {Route, Routes, HashRouter} from "react-router-dom";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import RegisterPage from "./Components/Pages/RegisterPage/RegisterPage";
import AppHeader from "./Components/AppHeader/AppHeader";
import { TransitionParams } from "./Logic/IGraphTypes";
import SuccessLoginPage from "./Components/Pages/SuccessLoginPage/SuccessLoginPage";
import RegisteredPage from "./Components/Pages/RegisteredPage/RegisteredPage";
import { VisNetwork } from './VisNetwork';
import {
    DataSet,
    Network,
    Options,
    Data,
} from "vis-network/standalone/esm/vis-network";
import {Output} from './Logic/Types';
import {NonDetermenisticModal, NonMinimizableModal} from './ErrorModal';
import {TreeHistory} from './TreeHistory';
import MePage from "./Components/Pages/MePage/MePage";
import {UserModel} from "./Models/UserModel";
import ApiGetUser from "./Api/apiGetUser";
import UserPage from './Components/Pages/UserPage/UserPage';

// import {ContextMenu, MenuItem as CotextMenuItem, ContextMenuTrigger} from "react-contextmenu";

interface appProps {
}

export type Elements = {
    nodes: DataSet<node, "id">,
    edges: DataSet<edge, "id">
}

export type HistElements = {
    nodes: DataSet<histNode, "id">,
    edges: DataSet<edge, "id">
}

interface appState {
    computerType: null | ComputerType,
    selectedNode: node | null,
    selectedEdge: edge | null,
    inEdgeMode: boolean,
    elements: Elements,
    treeElems: HistElements,
    options: any,
    initiallyStabilized: boolean,
    popout: ReactNode | null,
    savePopoutOpen: boolean,
    welcomePopoutOpen: boolean,
    isLogin: boolean,
    mem: string[] | undefined,
    ptr: number | undefined,
    wasComputerResetted: boolean,
    byEmptyStack: boolean,
    errIsNonDetermenistic: boolean,
    errIsNonMinimizable: boolean,
    showTree: boolean,
    History: (() => JSX.Element),
    user: UserModel | null,
}

export const ComputerTypeContext = React.createContext<null | ComputerType>(null);

export const computerAction = {
    init: (() => { }),
    nfaToDfa: (() => { }),
    minimizeDfa: (() => { }),
    mooreToMealy: (() => { }),
    mealyToMoore: (() => { })
}

export const controlAction = {
    changerByStack: (() => { }),
    run: (() => { }),
    step: (() => { }),
    reset: (() => { }),
}

// export interface errorAction {
//     isNonDetermenistic: boolean,
//     setIsNonDetermenistic: (v: boolean) => void
// }
// export const errorAction =  {
//     isNonDetermenistic: false,
//     setIsNonDetermenistic: (v: boolean): void => { errorAction.isNonDetermenistic = v }
// }


interface RibbonProps {
    computerType: null | ComputerType,
    wasComputerResetted: boolean,
    mem: string[] | undefined,
    ptr: number | undefined
    memRef: React.RefObject<HTMLDivElement>
}

export const Ribbon = (props: RibbonProps) => {
    return (
        props.computerType === "tm" && props.wasComputerResetted
            ?
            <div className="app__mem_ribbon">
                {
                    props.mem?.map((value, index) =>
                        <div
                            className="app__mem_cell"
                            style={{ border: `${index === props.ptr ? "#0041d0" : "#000000"} 2px solid` }}
                        >
                            {Math.abs(Math.abs(index) - Math.abs(props.ptr!)) <= 5
                                ? <div ref={props.memRef} />
                                : <div />
                            }
                            {value}
                            {props.memRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                        </div>
                    )
                }
            </div>
            : <div />
    )
}

class App extends React.Component<appProps, appState> {

    memRef = React.createRef<HTMLDivElement>();
    network = React.createRef<Network | null>();
    networkTST = React.createRef<Network | null>();

    constructor(props: appProps) {
        super(props);

        this.state = {
            computerType: null,

            selectedNode: null,
            selectedEdge: null,
            inEdgeMode: false,
            elements: { nodes: new DataSet<node>(), edges: new DataSet<edge>() },
            treeElems: { nodes: new DataSet<histNode>(), edges: new DataSet<edge>() },
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
            wasComputerResetted: false,
            byEmptyStack: false,

            errIsNonDetermenistic: false,
            errIsNonMinimizable: false,

            showTree: false,
            History: () => ( <div></div> ),
            // errorAction: {
            //     isNonDetermenistic: false,
            //     setIsNonDetermenistic: (v: boolean): void => { this.setState({ errorAction.isNonDetermenistic = v}) }
            // }
            user: null
        };
    }

    setIsNonDetermenistic = (v: boolean) => this.setState({ errIsNonDetermenistic: v })

    setIsNonMinimizable = (v: boolean) => this.setState({ errIsNonMinimizable: v })

    async componentDidMount() {
        await this.updateCurrentUser();

        this.updateGraph();
        // this.subscribeToShortcuts();
        this.openWelcomePopout();
    }

    lastNodeId = 0;

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    subscribeToShortcuts = () => {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            // if (event.key === "Shift" && !this.state.inEdgeMode) {
            //     this.enterEdgeMode();
            // }
            if (event.key === "s" && event.ctrlKey) {
                event.preventDefault();
                this.openSavePopout();
            }
        })

        // document.addEventListener("keyup", (event: KeyboardEvent) => {
        //     if (event.key === "Shift" && this.state.inEdgeMode) {
        //         this.leaveEdgeMode();
        //     }
        // })
    }

    openSavePopout = () => {
        this.setState({ savePopoutOpen: true });
    }

    closeSavePopout = () => {
        this.setState({ savePopoutOpen: false });
    }

    openWelcomePopout = () => {
        this.setState({ welcomePopoutOpen: true });
    }

    closeWelcomePopout = () => {
        this.setState({ welcomePopoutOpen: false });
    }

    logout = () => {
        document.cookie = `jwt=""; path=/; secure; max-age=-1`;
        this.setState({isLogin: false});
        this.updateCurrentUser();
    }

    updateCurrentUser = async () => {
        await ApiGetUser()
            .then(user => this.setState({user: user}))
            .catch(() => this.setState({user: null}));
    }

    setUser = (user: UserModel) => {
        this.setState({ user: user })
    }


    updateGraph = (): void => {
        decorateGraph(this.state.elements, this.state.computerType)
    }

    changeNodeLabel = (id: number, label: string): void => {
        this.state.elements.nodes.forEach((node) => {
            if (node.id === id) {
                const lableTokens =
                    label
                        .split('')
                        .filter(x => x !== " " && x !== "\n")
                        .join('')
                        .split('|')
                const output = lableTokens[1] !== undefined ? lableTokens[1] : ""
                this.state.elements.nodes.update({
                    id: node.id,
                    label: label,
                    output: output
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
        }
        this.state.elements.nodes.add(node);
    }

    lastHistNodeId = 0

    createHistNode = (idd: number, label: string, isAdmit: boolean, isInitial: boolean, isCurrent: boolean) => {
        this.lastHistNodeId++;

        const node: histNode = {
            id: this.lastHistNodeId,
            idd,
            label,
            isAdmit,
            isInitial,
            isCurrent
        }
        this.state.treeElems.nodes.add(node);
    }

    createHistEdge = (from: number, to: number, by: any) => {
        const transitions = new Set([[{ title: by }]])

        this.state.treeElems.edges.add({
            from: from,
            to: to,
            transitions: transitions,
            label: by
            // this.state.computerType !== 'mealy' && this.state.computerType !== 'dmealy'
                // ? transitionsToLabel(transitions, this.state.computerType)
                // : by
                // transitionsToLabel(transitions, this.state.computerType)
        })
    }

    historyEndRef = React.createRef<HTMLDivElement>();

    getLastHistNodeId = () => this.lastHistNodeId

    resetHistTree = () => {
        for (let i = 0; i <= this.lastHistNodeId; i++) {
            this.state.treeElems.nodes.remove(i)
        }
        this.state.treeElems.edges.forEach((e) => this.state.treeElems.edges.remove(e.id!))
        this.lastHistNodeId = 0;
        // this.state.treeElems.nodes.remove()
        // this.state.treeElems.edges.clear()
        // this.setState({
        //     treeElems: { nodes: new DataSet<histNode>(), edges: new DataSet<edge>() }
        // })
    }

    selectNode = (e: { nodes: number[]; }): void => {
        const nodesIDs: number[] = e.nodes;
        const selectedNodes = this.state.elements.nodes.get(nodesIDs);
        this.setState({ selectedNode: selectedNodes[0] });
    }


    deselectNode = (e: { nodes: number[]; }): void => {
        const nodesIDs: number[] = e.nodes;
        if (nodesIDs.length === 0) {
            this.setState({ selectedNode: null });
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
    }

    selectEdge = (e: { edges: any; }): void => {
        const edgesIDs: number[] = e.edges;
        const selectedEdges = this.state.elements.edges.get(edgesIDs);
        this.setState({ selectedEdge: selectedEdges[0] });
        console.log('click1  = selectEdge')
    }

    deselectEdge = (e: { edges: number[]; }): void => {
        const edgesIDs: number[] = e.edges;
        if (edgesIDs.length === 0) {
            this.setState({ selectedEdge: null });
        }
    }


    changeEdgeTransition = (id: string, transitions: Set<TransitionParams[]>): void => {
        this.state.elements.edges.update({
            id: id,
            label: transitionsToLabel(transitions, this.state.computerType),
            transitions: transitions
        })
    }

    deleteEdge = (id: string): void => {
        this.state.elements.edges.remove(id)
    }

    updMem = (mem: string[], ptr: number): void => {
        this.setState({ mem: mem, ptr: ptr });
    }

    NFAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.nfaToDfa}
                    >
                        {"НКА->ДКА"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    treeVisible = () => {
        this.setState({ showTree: !this.state.showTree})
        return !this.state.showTree
    }

    treeContextInfo = () => (this.state.showTree ? "Закрыть" : "Открыть") + " дерево вычислений"

    DFAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.minimizeDfa}
                    >
                        {"Минимизровать"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    MealyContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.mealyToMoore}
                    >
                        {"Мур"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    MooreContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.mooreToMealy}
                    >
                        {"Мили"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    PDAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.changerByStack}

                    >
                        {this.state.byEmptyStack ? "По стеку" : "По состоянию"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
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
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={this.treeVisible}
                    >
                        {this.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    ContextMenu = (computerType: null | ComputerType) => {
        switch (computerType) {
            case "nfa":
            case "nfa-eps": {
                return this.NFAContextMenu
            }
            case "dfa": {
                return this.DFAContextMenu
            }
            case "mealy":
            case "dmealy": {
                return this.MealyContextMenu
            }
            case "moore":
            case "dmoore": {
                return this.MooreContextMenu
            }
            case "pda":
            case "dpda": {
                return this.PDAContextMenu
            }
            default: {
                return this.AnotherContextMenu
            }
        }
    }


    render() {
        return (
            <HashRouter>
                <Routes>
                    <Route path="/login" element={
                        <LoginPage/>
                    }/>
                    <Route path="/register" element={
                        <RegisterPage/>
                    }/>
                    <Route path="/registered" element={
                        <RegisteredPage/>
                    }/>
                    <Route path="/success-login" element={
                        <SuccessLoginPage updateCurrentUser={this.updateCurrentUser}/>
                    }/>
                    <Route path="/me" element={
                        <MePage user={this.state.user}
                                onAuthFailed={this.logout}
                                changeComputerType={(computerType, graph: graph | null) => {
                                    const defaultGraph = graph || computersInfo[computerType!].defaultGraph;
                                    graphToElements(defaultGraph).nodes.forEach((v) => console.log(v))

                                    this.lastNodeId = defaultGraph.nodes.length;
                                    this.setState({
                                            computerType: computerType,
                                            elements: graphToElements(defaultGraph)
                                        }
                                        , () => this.updateGraph()
                                    );
                                }
                                }
                                setUser={this.setUser}
                        />
                    }/>
                    <Route path="/user/:userId" element={
                        <UserPage 
                            changeComputerType={
                                (computerType, graph: graph | null) => {
                                    const defaultGraph = graph || computersInfo[computerType!].defaultGraph;
                                    graphToElements(defaultGraph).nodes.forEach((v) => console.log(v))

                                    this.lastNodeId = defaultGraph.nodes.length;
                                    this.setState({
                                            computerType: computerType,
                                            elements: graphToElements(defaultGraph)
                                        }
                                        , () => this.updateGraph()
                                    );
                                }
                            }
                        />
                    }/>
                    <Route path="/" element={
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
                                              graph={elementsToGraph(this.state.elements)}
                                              computerType={this.state.computerType!}/>
                                <div className="history-container">
                                    {this.state.History()}
                                </div>
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
                                    <Paper className="hint" variant="outlined">
                                        ПКМ для открытия контекстного меню
                                    </Paper>
                                </div>
                                <NonDetermenisticModal
                                    isNonDetermenistic={this.state.errIsNonDetermenistic}
                                    setIsNonDetermenistic={this.setIsNonDetermenistic}
                                />
                                <NonMinimizableModal
                                    isNonMinimizable={this.state.errIsNonMinimizable}
                                    setIsNonMinimizable={this.setIsNonMinimizable}
                                />
                                <Ribbon
                                    computerType={this.state.computerType}
                                    wasComputerResetted={this.state.wasComputerResetted}
                                    mem={this.state.mem}
                                    ptr={this.state.ptr}
                                    memRef={this.memRef}
                                />

                                <AppHeader
                                    onMenuButtonClicked={this.openWelcomePopout}
                                    onSaveButtonClicked={this.openSavePopout}
                                    onLogoutButtonClicked={this.logout}
                                    isLogin={this.state.isLogin}
                                />


                                <div className="field__container">
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
                                        contextMenu={this.ContextMenu(this.state.computerType)}
                                    />
                                </div>

                                {this.state.showTree ?
                                    <div className="eval-tree">
                                        <TreeHistory
                                            nodes={this.state.treeElems.nodes}
                                            edges={this.state.treeElems.edges}
                                            data={this.state.treeElems}
                                            onDoubleClick={this.createNode}
                                            onClick1={this.selectEdge}
                                            onClick2={this.selectNode}
                                            onClick3={this.deselectNode}
                                            onClick4={this.deselectEdge}
                                            network={this.networkTST}
                                            contextMenu={this.ContextMenu(this.state.computerType)}
                                        />
                                    </div>
                                    : <div />}
                                <div className="app__right-menu">
                                    <NodeControl
                                        node={this.state.selectedNode}
                                        changeNodeLabel={this.changeNodeLabel}
                                        changeStateIsAdmit={this.changeStateIsAdmit}
                                        changeStateIsInitial={this.changeStateIsInitial}
                                        deleteNode={this.deleteNode}
                                        reinitComputer={computerAction.init}

                                    />
                                    <EdgeControl
                                        edge={this.state.selectedEdge}
                                        changeEdgeTransitions={this.changeEdgeTransition}
                                        deleteEdge={this.deleteEdge}
                                        computerType={this.state.computerType}
                                        reinitComputer={computerAction.init}
                                    />

                                    <RunControl
                                        updMem={this.updMem}
                                        elements={this.state.elements}
                                        treeElems={this.state.treeElems}
                                        createHistNode={this.createHistNode}
                                        createHistEdge={this.createHistEdge}
                                        getLastHistNodeId={this.getLastHistNodeId}
                                        resetHistTree={this.resetHistTree}
                                        changeStateIsCurrent={this.changeStateIsCurrent}
                                        network={this.network}
                                        setInit={(f: () => void) => computerAction.init = f}
                                        setNfaToDfa={(f: () => void) => computerAction.nfaToDfa = f}
                                        setMinimizeDfa={(f: () => void) => computerAction.minimizeDfa = f}
                                        setMooreToMealy={(f: () => void) => computerAction.mooreToMealy = f}
                                        setMealyToMoore={(f: () => void) => computerAction.mealyToMoore = f}
                                        updateElements={(elements: Elements) => this.setState({ elements: elements }, () => this.updateGraph())}
                                        setComputerType={(type: null | ComputerType) => this.setState({ computerType: type })}
                                        setResettedStatus={(status: boolean) => this.setState({ wasComputerResetted: status })}
                                        setByEmptyStack={(byEmptyStack: boolean) => this.setState({ byEmptyStack: byEmptyStack })}
                                        setChangerByStack={(f: () => void) => controlAction.changerByStack = f}
                                        setRun={(f: () => void) => controlAction.run = f}
                                        setStep={(f: () => void) => controlAction.step = f}
                                        setReset={(f: () => void) => controlAction.reset = f}
                                        setHistory={(jsx: () => JSX.Element) => this.setState({ History: jsx },
                                            () => this.historyEndRef?.current?.scrollIntoView({ behavior: 'smooth' }) )}
                                        historyEndRef={this.historyEndRef}
                                        setIsNonDetermenistic={this.setIsNonDetermenistic}
                                        setIsNonMinimizable={this.setIsNonMinimizable}
                                        treeContextInfo={this.treeContextInfo}
                                        treeVisible={this.treeVisible}
                                    />

                                </div>

                            </div>
                        </ComputerTypeContext.Provider>
                    }/>
                </Routes>
            </HashRouter>

        )
    }
}

export default App;