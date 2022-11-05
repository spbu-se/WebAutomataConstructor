import { History, position, Step, HistTrace, statement } from "./Types";
import { GraphCore, NodeCore, EdgeCore } from "./IGraphTypes";
import { Computer, EPS } from "./Computer";
import { NFA } from "./NFA";
import { Console } from "console";
import { positions } from "@mui/system";

 export class PetriNets extends Computer { 

    protected curPosition: position[];

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements)
        this.curPosition = []
        startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
            //console.log(`this statements get value id ${this.statements.get(value.id)}`)
            //console.log(`startStatements ${value.id}`);
        })
        //this.nodes = graph.nodes;
        this.setInput(input);
        this.counterSteps = 0;

        
        // console.log("ALPHBT")
        // this.alphabet.forEach((value, key) => console.log(value, key))
        // console.log("STMTS")
        // this.statements.forEach(value => console.log(value))
        // console.log("CURPOS")
        // console.log(this.curPosition)
        // console.log("MATRIX")
        // this.matrix.forEach(value => {
        //     console.log()
        //     value.forEach(value1 => console.log(value1))
        //     console.log(`end of MATRIX`);
        // })
    }

    public isTransitionActive(isActiveId: number): boolean {
        //console.log("I am in transition active");
        let isActiveNode: NodeCore = this.startStatements[0];
        let result = false;
        let curNumberOfArcs: number = 0;
        this.nodes.forEach(node => {
            if (node.id === isActiveId)
                isActiveNode = node; 
        })
        let way = this.input[this.counterSteps]?.value;
        //console.log(`this.counterSteps ${this.counterSteps}`);
        //console.log(`way ${way}`);
        
        this.edges.forEach(edge => {
            if (edge.from === isActiveNode.id) {
                edge.transitions.forEach(transition => transition.forEach(tr => {
                    if (tr.title === way)
                        curNumberOfArcs = tr.numberOfArcs!;
                }))
            }
        })

        if ((isActiveNode.countTokens! >= curNumberOfArcs) && (isActiveNode.countTokens! > 0)) {
            result = true;
            //console.log(`result is ${result}`);
            return result;
        }
       
        return result;
    }

    private changeCountTokens(nodeForChange: position[]): void {
        //console.log(`changeCountTokens`);
        //console.log(idForChange);
        //console.log(`end list pos for change`);
        let lastCurNode: NodeCore;
        let lastFromNode: NodeCore;
        nodeForChange.forEach(nod => {
            // if (lastCurNode !== nod.cur && nod.cur !== undefined){
                this.plusToken(nod.cur!);
            //     lastCurNode = nod.cur;
            // }
            if (lastFromNode !== nod.from && nod.from !== undefined){
                this.minusToken(nod.from!);
                lastFromNode = nod.from;
            }
        })

        //console.log(`after changeCountTokens`)
        //console.log(idForChange);
        //this.nodes.forEach(node => node.isChangedTokens = false)
    }


    private minusToken(value: NodeCore): void {
        //if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
        if ((value.countTokens !== undefined) && (value.countTokens > 0)) {    
            value.countTokens--;
            //value.isChangedTokens = true;
        }
    }

    private plusToken(value: NodeCore): void {
        if ((value.countTokens !== undefined)) {
            value.countTokens++;
            //value.isChangedTokens = true;
        }
        //console.log(`I was in plusToken countTokens ${value.countTokens}`);
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

    // protected toNodes = (positions: position[]): NodeCore[] => {
    //     console.log('positionsd')
    //     positions.forEach(po => console.log(po))
    //     console.log('end positionsd');
    
    //     let edgesMap: EdgeCore[] = [];
    //     let schet: number = 0;
        
    //     positions.forEach(position => {
    //         this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
    //             console.log('START');
    //             console.log(way.title);
    //             console.log(this.input[this.counterSteps]?.value)
    //             console.log(edge.from);
    //             console.log(position.stmt.id);
    //             console.log('END');
    //             if ((way.title === (this.input[this.counterSteps]?.value)) && (edge.from === position.stmt.id)){
    //                 edgesMap.push(edge);
    //                 console.log('push srabotal')
    //             }
    //         })))
    //     })
    //     console.log('edgesMap')
    //     edgesMap.forEach(edgM => console.log(edgM))
    //     console.log('edgesMap');
    
    //     let toNodes_: NodeCore[] = [];
    //     edgesMap.forEach(edge => this.nodes.forEach(node => {
    //         if (node.id === edge.to) {
    //             toNodes_.push(node);
    //         }
    //     }))  
    //     console.log('posmotrim')
    //     toNodes_.forEach(toN => console.log(toN))
    //     console.log('end posmotrim');
    //     //toNodes_.forEach(toNode => console.log(toNode.id));
    //     let toNodes = Array.from(new Set(toNodes_))
    //     console.log('TONODES')
    //     toNodes.forEach(toNode => console.log(toNode))
    //     console.log('TONODES')
    //     return toNodes;      
    // }

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
            //console.log(ret);
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
        console.log('PETRI NET RUN++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        
        this.historiRun = []
        this.counterStepsForResult = 0
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun
            }

            // console.log(`BEFORE AFTER`);
            // console.log(ref.counterSteps);
            // console.log(ref.curPosition);
            // console.log(ref.historiStep);

            const after = this._step(ref)
             console.log(`AFTER AFTER :)`);
             console.log(ref.counterSteps);
            console.log(ref.curPosition);
            console.log(ref.historiStep);
            console.log(`END AFTER`);
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            // console.log('HISTORY RUN');
            // console.log(this.historiRun[0].nodes);
            // console.log('END HISTORY RUN');
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
            if (this.isTransitionActive(curPos.stmt.id) === false){
                return this.isTransitionActive
            }
       })
       return true;
    }

    protected getNode = (positions: position[]): NodeCore[] => {
        let getNod: NodeCore[] = [];
        positions.forEach(pos => {
            getNod.push(pos.stmt)
            console.log(`pos.cur`);
            console.log(pos.stmt);
            console.log(`end pos.cur`);
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
        console.log('history step');
        console.log(ref.historiStep[0].nodes);
        console.log('end history step');
        if (ref.curPosition.length > 0) {
            ref.counterSteps++
        }


        const nextPositions = this.nextStepPositions(ref.curPosition, trNum)
       
        ref.curPosition = nextPositions;
        this.changeCountTokens(ref.curPosition);
        
        const nodesOfCurPos = this.toNodes(ref.curPosition)
       
        nodesOfCurPos.forEach((node) => byLetter.push(node))
        // console.log('NODEOFCURPOSITION')
        // console.log(nodesOfCurPos);
        // console.log('END NODE OF CURPOSITION');

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
            { from: 0, to: 1, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) },
            { from: 0, to: 2, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
            { from: 0, to: 3, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
            { from: 1, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
            { from: 2, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) }, 
            { from: 3, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
            { from: 3, to: 4, transitions: new Set([[{ title: 'c', numberOfArcs: 1 }]]) },
            { from: 4, to: 2, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
            { from: 4, to: 3, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
        ]
    },  [{ id: 0, isAdmit: false }], ["b"])
//console.log(`It's petri run \n ${petri.run()}`)
//console.log(`It's petri step \n ${petri.step()}`)
console.log(petri.step());
//console.log(petri.step());












    // let petri = new PetriNets({
    //     nodes: [
    //         { id: 0, isAdmit: false, countTokens: 1 }, 
    //         { id: 1, from: {id: 0, isAdmit: false, countTokens: 1 }, isAdmit: false, countTokens: 0 }, 
    //     ],
    //     edges: [
    //         { from: 0, to: 1, transitions: new Set([[{title: 'a', numberOfArcs: 1 }]]) }, 
    //         ]
    // }, [{id: 0, isAdmit: false }], ["a"])
    
    // console.log(`It's petri run \n ${petri.run()}`);
    
    









    //console.log(`It's petri step \n ${petri.step()}`);

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
