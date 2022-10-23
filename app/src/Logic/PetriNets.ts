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
            //console.log(`this statements get value id ${this.statements.get(value.id)}`)
            console.log(`startStatements ${value.id}`);
        })
        //this.nodes = graph.nodes;
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
            console.log(`end of MATRIX`);
        })
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

        // this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(tr => {
        //     console.log(`tr title = ${tr.title}, edge.from == ${edge.from}, edge.to == ${edge.from}, isActiveNode from id == ${isActiveNode.from?.id}
        //     , isActiveNode id === ${isActiveNode.id}`);
        //     if ((tr.title === way) && (isActiveNode.from?.id === edge.from) && (isActiveNode.id === edge.to)) {
        //         curNumberOfArcs = tr.numberOfArcs!;
        //         console.log(`tr.title ${tr.title} and way ${way}`);
        // }})))

        //console.log(`Node id ${isActiveNode.id} and node.countTokens ${isActiveNode.countTokens!} and curNumberArcs ${curNumberOfArcs}`)

        if ((isActiveNode.countTokens! >= curNumberOfArcs) && (isActiveNode.countTokens! > 0)) {
            result = true;
            console.log(`result is ${result}`);
            return result;
        }
        //console.log(`result isTransitionActive ${result}`);
        //console.log("-----------------------------------------------------------------------------------------------");
        return result;
    }

    private changeCountTokens(idForChange: number[]): void {

        let nodesForChange: NodeCore[] = [];
        idForChange.forEach(id => this.nodes.forEach(node => {
            if (id === node.id) {
                nodesForChange.push(node);
                //console.log(`nodesForChange`);
                //console.log(node);
            }
        }))
        let plus: NodeCore[] = [];
        this.toNodes(this.curPosition).forEach(toNode => plus.push(toNode));
        plus.forEach(pl => this.plusToken(pl));
        console.log(`nodesForChange`);
        
        nodesForChange.forEach(node => console.log(node));
        nodesForChange.forEach(nodeForChange => {
            //this.edges.forEach(edge => {
                //if (edge.from === nodeForChange.id) {
                    this.minusToken(nodeForChange)
                    //edgePlusToken.push(edge);
                //}
                // if (edge.to === nodeForChange.id) {
                //     this.plusToken(nodeForChange)
                // }
            }
            )   
       
        console.log('I am in changeCountTokens');
        console.log(nodesForChange);
        this.nodes.forEach(node => node.isChangedTokens = false)
    }


    private minusToken(value: NodeCore): void {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens--;
            value.isChangedTokens = true;
        }
        //console.log(`i was in minusToken ${value.countTokens}`);
    }

    private plusToken(value: NodeCore): void {
        if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
            value.countTokens++;
            value.isChangedTokens = true;
        }
        //console.log(`I was in plusToken countTokens ${value.countTokens}`);
    }

    // protected givesEdgeByType = (from: number, schet: number): EdgeCore => {
    //     let check: number = 0;
    //     let result: EdgeCore;
    //     result = this.edges[0];
    //     this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
    //         //console.log(`way.title ${way.title} and input ${this.input[this.counterSteps]?.value} and edge.from ${edge.from} and from ${from}`);
    //         console.log(`check ${check}`);
    //         console.log(`schet ${schet}`);
    //         if (way.title === (this.input[this.counterSteps]?.value) &&  (edge.from === from)) {
    //             check++;
    //             if ( check === schet )
    //             result = edge;
                
    //             //console.log(edge);
    //             return result;
    //         }
    //     }))) 
    //     return result;
    // }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

    protected toNodes = (positions: position[]): NodeCore[] => {
    
        let edgesMap: EdgeCore[] = [];
        let schet: number = 0;
        
        positions.forEach(position => {
            //console.log(`position.cur! ${position.cur!.id}`);
            //if (this.isTransitionActive(position.cur!)) {
            this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
                if ((way.title === (this.input[this.counterSteps]?.value)) && (edge.from === position.stmt.id)){
                    edgesMap.push(edge);
                    console.log(`edge from ${edge.from} and edge to ${edge.to}`);
                }
            })))
        })
    
        let toNodes_: NodeCore[] = [];
        edgesMap.forEach(edge => this.nodes.forEach(node => {
            if (node.id === edge.to) {
                toNodes_.push(node);
            }
        }))  
        //toNodes_.forEach(toNode => console.log(toNode.id));
        let toNodes = Array.from(new Set(toNodes_))
        toNodes.forEach(toNode => console.log(`toNode ${toNode.id}`))
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
        const after = this._step(ref, [])
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep
        //this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
        console.log(`this curPosition`);
        console.log(this.curPosition);
        //this.changeCountTokens(this.curPosition);
        
        //console.log(`counter ${after.counter}, history ${after.history.length}, isAdmit ${after.isAdmit}, nodes ${after.nodes[0].id}, byLetter ${after.byLetter}`);
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
        console.log("-------------------------------------------------------------------");
        for (let i = 0; i < this.input.length; i++) {
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun
            }
            this.curPosition.forEach(curPos => console.log(`curPos in Run ${curPos.stmt.id}`))

            console.log(`ref.counterSteps ${ref.counterSteps} and ref.historiRun ${this.historiRun}`);

            const after = this._step(ref, histTrace)
            this.counterStepsForResult = ref.counterSteps
            //ref.curPosition = this.nextStepPositions(this.curPosition, this.alphabet.get(this.input[this.counterSteps]?.value));

            //console.log(this.counterStepsForResult)
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            //this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
            //this.changeCountTokens(this.curPosition);
        
        }
        console.log(`petri return`)
        this.historiRun.forEach(hist => console.log(`historyRun ${hist.by}`))
        console.log(`this.counterStepsForResult === ${this.counterStepsForResult} and this.historiRun ${this.historiRun} and this.haveAdmitting(this.curPosition)
        ${this.haveAdmitting(this.curPosition)} and this.toNodes(this.curPosition) ${this.toNodes(this.curPosition)}`);
        //this.curPosition = this.nextStepPositions(this.curPosition, this.alphabet.get(this.input[this.counterSteps]?.value))
        console.log(`this curPosition after changes`);
        this.curPosition.forEach(curPos => {
            console.log(`begin curPos`);
            console.log(curPos)
        });
        //this.curPosition.forEach(curPos => console.log(`this.curPosition in pnRun ${curPos.cur!.id}`));
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

    protected checkTransition(ref: {counterSteps: number, curPosition: position[], historiStep: History[] }){

        this.curPosition.forEach(curPos => {
            console.log(`this curPOsition ${curPos.cur?.id}`);
            //this.isTransitionActive(curPos.stmt.id);
            if (this.isTransitionActive(curPos.stmt.id) === false){
                console.log(`srabotal perehod v stepe`);
                return this.isTransitionActive
            }
       })
       return true;
    }

    protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }, histTrace: HistTrace[]): Step => {
        console.log(`STEP BEGIN`);
        const byLetter: NodeCore[] = [];
        const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
        console.log(`TRACE NUMBER ${trNum}`);
        //this.changeCountTokens(this.curPosition);
        // if (this.checkTransition(ref)) {
        //     console.log(`nu if srabotal v stepe poluchaetsa`)
        //     ref.counterSteps++;
        //     return {
        //         counter: ref.counterSteps,
        //         history: ref.historiStep, 
        //         nodes: this.toNodes(this.curPosition),
        //         isAdmit: this.haveAdmitting(this.curPosition),
        //         byLetter, 
        //         histTrace
        //     }
        // }

        const nextPositions = this.nextStepPositions(ref.curPosition, trNum)
        //let nowPositions: position[] = [];
        //nextPositions.forEach(next => nowPositions.push(next.));
        let numChange: number[] = [];
        nextPositions.forEach(next => numChange.push(next.from?.id!))
        this.changeCountTokens(numChange);
        ref.curPosition = nextPositions;
        console.log(`NEXTSTEPPOSITIONS`);
        ref.curPosition.forEach(cr => console.log(cr));
        console.log(`END OF NEXTSTEPPOSITIONS`);

        const nodesOfCurPos = this.toNodes(ref.curPosition)
        //nodesOfCurPos.forEach(node => console.log(`nodeOfCurPos ${node.id}, ${node.by}`))
        nodesOfCurPos.forEach((node) => byLetter.push(node))
        console.log(``);

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

//let st = petri.step();
//console.log(`It's petri run \n ${petri.run()}`)
//console.log(`It's petri step \n ${petri.step()}`)
console.log(petri.run());
//console.log(petri.step());



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
//             { from: 0, to: 3, transitions: new Set([[{ title: 'a', numberOfArcs: 1 }]]) }, 
//             { from: 1, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 2, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) }, 
//             { from: 3, to: 1, transitions: new Set([[{ title: 'b', numberOfArcs: 1 }]]) },
//             { from: 3, to: 4, transitions: new Set([[{ title: 'c', numberOfArcs: 1 }]]) },
//             { from: 4, to: 2, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//             { from: 4, to: 3, transitions: new Set([[{ title: 'd', numberOfArcs: 1 }]]) },
//         ]
//     },  [{ id: 0, isAdmit: false }], ["a", "c"])
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// //console.log(petri.step());












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
