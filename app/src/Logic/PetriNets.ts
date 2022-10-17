import { History, position, Step, HistTrace, statement } from "./Types";
import { GraphCore, NodeCore, EdgeCore } from "./IGraphTypes";
import { Computer, EPS } from "./Computer";
import { NFA } from "./NFA";

 export class PetriNets extends Computer { 

    protected curPosition: position[];

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements)
        this.curPosition = []
        startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
        })
        this.setInput(input);
        this.counterSteps = 0;

        console.log("ALPHBT")
        this.alphabet.forEach((value, key) => console.log(value, key))
        console.log("STMTS")
        this.statements.forEach(value => console.log(value))
        console.log("CURPOS")
        console.log(this.curPosition)
        console.log("MATRIX")
        this.matrix.forEach(value => {
            console.log()
            value.forEach(value1 => console.log(value1))
        })
    }

    public isTransitionActive(isActiveId: number): boolean {
        let isActiveNode: NodeCore = this.startStatements[0]
        let result = false
        let curNumberOfArcs: number = 0
        this.nodes.forEach(node => {
            if (node.id === isActiveId) {
                isActiveNode = node
            }
        })
        let way = this.input[this.counterSteps]?.value
        
        this.edges.forEach(edge => {
            if (edge.from === isActiveNode.id) {
                edge.transitions.forEach(transition => transition.forEach(tr => {
                    if (tr.title === way) 
                        curNumberOfArcs = tr.numberOfArcs!
                }))
            }
        })
       
        if ((isActiveNode.countTokens! >= curNumberOfArcs) && (isActiveNode.countTokens! > 0)) {
            result = true;
            return result;
        }
        
        return result;
    }

    private changecountTokens(posForChange: position[]): void {

        let nodesForChange: NodeCore[] = [];
        posForChange.forEach(pos => this.nodes.forEach(node => {
            if (pos.stmt.id === node.id) {
                nodesForChange.push(node);
            }
        }))
        
        nodesForChange.forEach(nodeForChange => {
            this.edges.forEach(edge => {
                if (edge.from === nodeForChange.id) {
                    this.minusToken(nodeForChange)
                }
                if (edge.to === nodeForChange.id) {
                    this.plusToken(nodeForChange)
                }
            })   
        })
        this.nodes.forEach(node => node.isChangedTokens = false)
    }


    private minusToken(value: NodeCore): void {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens--;
            value.isChangedTokens = true;
        }
    }

    private plusToken(value: NodeCore): void {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens++;
            value.isChangedTokens = true;
        }
    }

    protected givesEdgeByType = (from: number): EdgeCore => {
        let result: EdgeCore
        result = this.edges[0]
        this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
            if (way.title === (this.input[this.counterSteps]?.value) &&  (edge.from === from)) {
                result = edge
                return result
            }
        }))) 
        return result
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

    protected toNodes = (positions: position[]): NodeCore[] => {
    
        let edgesMap: EdgeCore[] = []
        
        positions.forEach(position => {
            this.edges.forEach(edge => {
                let needEdge = this.givesEdgeByType(edge.from)
                edgesMap.push(needEdge)
                console.log(`needEdge ${needEdge}`)
            })
        })
    
        let toNodes: NodeCore[] = []
        edgesMap.forEach(edge => this.nodes.forEach(node => {
            if (node.id === edge.to) {
                toNodes.push(node)
            }
        }))  
        return toNodes;      
    }

    protected nextStepPosition = (position: position, by: number): position[] => {
        return this.cellMatrix(position.stmt.idLogic, by).map(v => {
            const getLetter = (id: number): any => {
                let ret
                this.alphabet.forEach((v, k) => {
                    if (id === v) {
                        ret = k
                    }
                })
                return ret
            }
    
            const ret: position = { 
                stmt: v, 
                by: getLetter(by), 
                cur: this.nodes[v.idLogic], 
                from: this.nodes[position.stmt.idLogic]
            }
            console.log(ret);
            return ret
        })
    }

    public setInput = (input: string[]) => {
        this.input = []
        input.forEach(value => {
            this.input.push({ idLogic: this.alphabet.get(value), value: value })
        })
        this.restart()
    }
    
    protected nextStepPositions = (positions: position[], by: number): position[] => {
        let acc: position[] = []
        positions.map((v) =>
            this.nextStepPosition(v, by)).forEach((ps) =>
                ps.forEach((p) => acc.push(p)))
        return acc
    }
    
    pnStep = (): Step => {
        const ref = { 
            counterSteps: this.counterSteps,
            curPosition: this.curPosition, 
            historiStep: this.historiStep 
        }
        const after = this._step(ref, [])
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep
        this.changecountTokens(this.curPosition);
        
        return {
            counter: after.counter,
            history: after.history,
            isAdmit: after.isAdmit,
            nodes: after.nodes,
            byLetter: after.byLetter
        }
    }
    
    pnRun = (): Step => {
        const histTrace: HistTrace[] = [];
        
        this.historiRun = []
        this.counterStepsForResult = 0
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun
            }
            const after = this._step(ref, histTrace)
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            this.changecountTokens(this.curPosition);
        }
        return { 
            counter: this.counterStepsForResult, 
            history: this.historiRun, 
            isAdmit: this.haveAdmitting(this.curPosition), 
            nodes: this.toNodes(this.curPosition),
            histTrace
        }
    }


    protected haveAdmitting(positions: position[]): boolean {
        return positions.reduce((acc: boolean, p) => acc && p.stmt.isAdmit, true)
    }

    protected checkTransition(ref: {counterSteps: number, curPosition: position[], historiStep: History[] }, histTrace: HistTrace[]){

        this.curPosition.forEach(curPos => {
            if (this.isTransitionActive(curPos.stmt.id) === false){
                return this.isTransitionActive
            }
       })
       return true;
    }

    protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }, histTrace: HistTrace[]): Step => {
        const byLetter: NodeCore[] = [];
        const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
        
        if (this.checkTransition(ref, histTrace)) {
            ref.counterSteps++;
            return {
                counter: ref.counterSteps,
                history: ref.historiStep, 
                nodes: this.toNodes(this.curPosition),
                isAdmit: this.haveAdmitting(this.curPosition),
                byLetter, 
                histTrace
            }
        }
        const nextPositions = this.nextStepPositions(ref.curPosition, trNum)

        ref.curPosition = nextPositions;

        const nodesOfCurPos = this.toNodes(ref.curPosition)
        nodesOfCurPos.forEach((node) => byLetter.push(node))

        ref.historiStep.push({nodes: nodesOfCurPos, by: trNum })
        if (ref.curPosition.length > 0) {
            ref.counterSteps++
        }

        histTrace.push({ byLetter })

        return {
            counter: ref.counterSteps,
            history: ref.historiStep, 
            nodes: nodesOfCurPos, 
            isAdmit: this.haveAdmitting(this.curPosition),
            byLetter, 
            histTrace
        }
    }

    public restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
        })
    }

    step = this.pnStep;
    run = this.pnRun;

}

let petri = new PetriNets({
    nodes: [
        { id: 0, isAdmit: false, countTokens: 0, isChangedTokens: false }, 
        { id: 1, isAdmit: false, countTokens: 1, isChangedTokens: false }, 
        { id: 2, isAdmit: false, countTokens: 0, isChangedTokens: false },
    ],
    edges: [
        { from: 0, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) }, 
        { from: 1, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) },
    ]
}, [{id: 0, isAdmit: false }, { id: 1, isAdmit: false }], ["a"])

console.log(`It's petri run \n ${petri.run()}`);


// let petri = new PetriNets({

//         nodes: [
//             { id: 0, isAdmit: false, countTokens: 1 }, 
//             { id: 1, isAdmit: false, countTokens: 0 },
//             { id: 2, isAdmit: false, countTokens: 0 }, 
//             { id: 3, isAdmit: false, countTokens: 2 },
//             { id: 4, isAdmit: false, countTokens: 1 },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
//             { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
//             { from: 0, to: 3, transitions: new Set([[{ title: 'a', numberOfArcs: 2 }]]) }, 
//             { from: 1, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 2, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) }, 
//             { from: 3, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 3, to: 4, transitions: new Set([[{ title: 'c', numberOfArcs: 2 }]]) },
//             { from: 4, to: 2, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//             { from: 4, to: 3, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//         ]
//     },  [{ id: 0, isAdmit: false }], ["a"])

// let nfa = new Moor(
// {
//     nodes: [
//         { id: 0, isAdmit: false, output: '0' },
//         { id: 1, isAdmit: false, output: '1' },
//         { id: 2, isAdmit: false, output: '2' },
//         { id: 3, isAdmit: false, output: '3' },
//     ],
//     edges: [
//         { from: 0, to: 1, transitions: new Set([[{ title: '5' }]]) },
//         { from: 1, to: 2, transitions: new Set([[{ title: '10'}]]) },
//         { from: 2, to: 3, transitions: new Set([[{ titlhe: '10'}]]) },
//         { from: 3, to: 3, transitions: new Set([[{ title: '5' }]]) },
//     ]
// }, [{ id: 0, isAdmit: false }], ["5"])

// console.log(nfa.run())
// console.log(nfa.step())
// console.log(nfa.step())
// // let node: NodeCore = { id: 1, isAdmit: false, countTokens: 1 };
// // petri.isTransitionActive(node);
