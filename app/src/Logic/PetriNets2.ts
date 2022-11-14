import { History, position, Step } from "./Types";
import { GraphCore, NodeCore, CountArcs } from "./IGraphTypes";
import { Computer, EPS } from "./Computer";


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
    }

    public isTransitionActive(isActive: position): boolean {
         let result = false;
        const numberArcs = this.giveNumberArcs(isActive);

        if ((isActive.cur?.countTokens! >= numberArcs.InputArcs) && (isActive.cur?.countTokens! > 0)) {
            result = true;
        }
       
        return result;
    }

    protected giveNumberArcs = (pos: position): CountArcs => {
        let arcs: CountArcs = {InputArcs: 1, OutputArcs: 1};
               
        this.edges.forEach(edge => edge.transitions.forEach(tr => tr.forEach(way => {
            if ((pos.stmt.id === edge.to) && (edge.from === pos.from?.id) && (way.title === this.input[this.counterSteps]?.value)){
                arcs = { InputArcs: way.countArcs!.InputArcs, OutputArcs: way.countArcs!.OutputArcs}
            }
        })))
        return arcs;
    }

    private changeCountTokens(nodeForChange: position[]): void {
        let lastFromNode: NodeCore;
        nodeForChange.forEach(nod => {
            const countArcs = this.giveNumberArcs(nod)
            this.plusToken(nod.cur!, countArcs);

            if (lastFromNode !== nod.from && nod.from !== undefined){
                this.minusToken(nod.from!, countArcs);
                lastFromNode = nod.from;
            }
        })
    }


    private minusToken(value: NodeCore, countArcs: CountArcs): void {
        if ((value.countTokens !== undefined) && (value.countTokens > 0)) {   
            value.countTokens-= countArcs.InputArcs;
        }
    }

    private plusToken(value: NodeCore, countArcs: CountArcs): void {
        if ((value.countTokens !== undefined)) {
            value.countTokens += countArcs.OutputArcs;
        }
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

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
        const after = this._step(ref)
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep

        return {
            counter: after.counter,
            history: after.history,
            isAdmit: after.isAdmit,
            nodes: after.nodes,
            byLetter: after.byLetter
        }
    }
    
    pnRun = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun
            }
            const after = this._step(ref)
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
        }
        
        return { 
            counter: this.counterStepsForResult, 
            history: this.historiRun, 
            isAdmit: this.haveAdmitting(this.curPosition), 
            nodes: this.toNodes(this.curPosition),
        }
    }


    protected haveAdmitting(positions: position[]): boolean {
        return positions.reduce((acc: boolean, p) => acc && p.stmt.isAdmit, true)
    }

    protected checkTransition(ref: {counterSteps: number, curPosition: position[], historiStep: History[] }){

        this.curPosition.forEach(curPos => {
            if (this.isTransitionActive(curPos) === false){
                return this.isTransitionActive
            }
        })
       return true;
    }

    protected getNode = (positions: position[]): NodeCore[] => {
        let getNod: NodeCore[] = [];
        positions.forEach(pos => {
            getNod.push(pos.stmt)
        });
        return getNod
    }

    private toNodes(positions: position[]): NodeCore[] {
        let retNodes: NodeCore[] = []
        positions.forEach(value => {
            const from: NodeCore = {
                id: value.from!.id,
                isAdmit: value.from!.isAdmit,
                countTokens: value.from!.countTokens
            }

            let temp: NodeCore = {
                ...this.nodes[value.stmt.idLogic], 
                from,
                cur: value.cur,
                by: value.by,
            }
            retNodes.push(temp)
        })
        return retNodes
    }

    protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }): Step => {
        const byLetter: NodeCore[] = [];
        const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
        ref.historiStep.push({nodes: this.getNode(ref.curPosition), by: trNum })
        if (ref.curPosition.length > 0) {
            ref.counterSteps++
        }
        const nextPositions = this.nextStepPositions(ref.curPosition, trNum)
       
        ref.curPosition = nextPositions;
        this.changeCountTokens(ref.curPosition);
        const nodesOfCurPos = this.toNodes(ref.curPosition)
        nodesOfCurPos.forEach((node) => byLetter.push(node))
        
        return {
            counter: ref.counterSteps,
            history: ref.historiStep, 
            nodes: nodesOfCurPos, 
            isAdmit: this.haveAdmitting(this.curPosition),
            byLetter, 
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

// let petri = new PetriNets({
//     nodes: [
//         { id: 0, isAdmit: false, countTokens: 1, isChangedTokens: false }, 
//         { id: 1, isAdmit: false, countTokens: 1, isChangedTokens: false }, 
//         { id: 2, isAdmit: false, countTokens: 0, isChangedTokens: false },
//     ],
//     edges: [
//         { from: 0, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) }, 
//         { from: 1, to: 2, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) },
//     ]
// }, [{id: 0, isAdmit: false }, { id: 1, isAdmit: false }], ["a"])

// //let st = petri.step();
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// //console.log(petri.step());



let petri = new PetriNets({

        nodes: [
            { id: 0, isAdmit: false, countTokens: 1 }, 
            { id: 1, isAdmit: false, countTokens: 0 },
            { id: 2, isAdmit: false, countTokens: 0 }, 
            { id: 3, isAdmit: false, countTokens: 2 },
            { id: 4, isAdmit: false, countTokens: 1 },
        ],
        edges: [
            { from: 0, to: 1, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
            { from: 0, to: 2, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) }, 
            { from: 0, to: 3, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 2} }]]) }, 
            { from: 1, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
            { from: 2, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) }, 
            { from: 3, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
            { from: 3, to: 4, transitions: new Set([[{ title: 'c', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
            { from: 4, to: 2, transitions: new Set([[{ title: 'd', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
            { from: 4, to: 3, transitions: new Set([[{ title: 'd', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
        ]
    },  [{ id: 0, isAdmit: false }], ["a"])
//console.log(`It's petri run \n ${petri.run()}`)
//console.log(`It's petri step \n ${petri.step()}`)
console.log(petri.step());
//console.log(petri.step());

