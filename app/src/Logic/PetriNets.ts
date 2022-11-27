import { History, position, Step, HistTrace, HistUnit } from "./Types";
import { GraphCore, NodeCore, CountArcs, EdgeCore } from "./IGraphTypes";
import { Computer, EPS, statementCell } from "./Computer";


export type returnTokensId = {
    nodeId: number,
    countTokens: number,
}

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
        this.setInput(input)
        this.treeHist = []
        this.counterSteps = 0;
    }

    protected treeHist: HistUnit[][] = []

    public isTransitionActive(isActive: NodeCore, letterId: number): boolean {
        let result = false;
        let edgesSet: EdgeCore[] = [];
        this.edges.forEach(edge => edge.transitions.forEach(tr => tr.forEach(way => {
            if ((edge.from === isActive.id) && (way.title === this.getLetterByNum(letterId)))
                edgesSet.push(edge);
        })))
        edgesSet.forEach(ed => ed.transitions.forEach(tr => tr.forEach(way => {
            if ((ed.from === isActive.id) && (way.title === this.getLetterByNum(letterId)) && (isActive.countTokens! >= way.countArcs?.InputArcs!)
            && (isActive.countTokens! > 0))
                result = true;
        })))
        return result;
    }

    protected giveNumberArcs = (pos: position): CountArcs => {
        let arcs: CountArcs = {InputArcs: 1, OutputArcs: 1};
               
        this.edges.forEach(edge => edge.transitions.forEach(tr => tr.forEach(way => {
            if ((pos.stmt.id === edge.to) && (edge.from === pos.from?.id) && (way.title === pos.by)){
                arcs = { InputArcs: way.countArcs!.InputArcs, OutputArcs: way.countArcs!.OutputArcs}
            }
        })))
        return arcs;
    }

    private changeCountTokens(posForChange: position[]): {'minusId': Set<returnTokensId>, 'plusId': Set<returnTokensId>,} {
        let lastFromNode: NodeCore;
        let setPosition = Array.from(new Set(posForChange));
        let minusId = new Set<returnTokensId>() ;
        let plusId = new Set<returnTokensId>();
        setPosition.forEach(pos => {
            const countArcs = this.giveNumberArcs(pos);
            console.log(`count arcs ${countArcs.InputArcs} and ${countArcs.OutputArcs}`)
            let retPlus = {} as returnTokensId;
            retPlus.countTokens = this.plusToken(pos.cur!, countArcs);
            retPlus.nodeId = pos.stmt.id;
            plusId.add(retPlus);

            let retMinus = {} as returnTokensId;
            if (lastFromNode !== pos.from && pos.from !== undefined){
                
                retMinus.countTokens = this.minusToken(pos.from!, countArcs);
                retMinus.nodeId = pos.from.id;
                minusId.add(retMinus)
                lastFromNode = pos.from;
            }
        })
        return  {
            'minusId': minusId, 
            'plusId': plusId, 
        }
    }

    private minusToken(value: NodeCore, countArcs: CountArcs): number {
        let countMinusTokens: number = 0;
        if ((value.countTokens !== undefined) && (value.countTokens > 0)) {   
            value.countTokens-= countArcs.InputArcs;
            countMinusTokens++
        }
        return countMinusTokens;
    }

    private plusToken(value: NodeCore, countArcs: CountArcs): number {
        let count = 0;
        if ((value.countTokens !== undefined)) {
            value.countTokens += countArcs.OutputArcs;
            count += countArcs.OutputArcs;
        }
        return count;
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

    protected toPosition = (nod: NodeCore, by: number): position => {
          
            const ret: position = { 
                stmt: this.statements.get(nod.id), 
                by: this.getLetterByNum(by), 
                cur: nod, 
                from: nod.from
            }
            //console.log(nod.from?.id)
            return ret
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
    //вытянуть все ноды связанные с каждой буквой алфавита
    protected getNodeByLetterId = (letterId: number): Set<NodeCore> => {
        let nodesId = new Set<number>();
        let setOfNodes = new Set<NodeCore>();
        this.edges.forEach(edge => edge.transitions.forEach(tr => 
            tr.forEach(way => {
                if ((way.title === this.getLetterByNum(letterId)) && !(nodesId.has(edge.from)))
                    nodesId.add(edge.from)
            })))
        
        nodesId.forEach(nodId => 
            this.nodes.forEach(node => {
                if ((node.id === nodId) && (!setOfNodes.has(node))){
                    setOfNodes.add(node)
        }}))
        setOfNodes.forEach(nodeFromSet => {
            if (!this.isTransitionActive(nodeFromSet, letterId)){
                return null;
            }
        })
        return setOfNodes
    }

    pnStep = (): Step => {
        const alphabetSize = this.alphabet.size;
        const histUnit: HistUnit[] = []
        const ref = { 
            counterSteps: this.counterSteps,
            curPosition: this.curPosition, 
            historiStep: this.historiStep,
        }
        const after = this._step(ref, histUnit)
        this.counterSteps = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiStep = ref.historiStep
        console.log(`history step `)
        console.log(this.historiStep)
        this.treeHist = after.tree ? after.tree: []
        console.log(this.treeHist)
        return {
            counter: after.counter,
            history: after.history,
            isAdmit: after.isAdmit,
            nodes: after.nodes,
            byLetter: after.byLetter
        }
    }
    
    pnRun = (): Step => {
        const histUnit: HistUnit[] = []
        this.historiRun = []
        this.counterStepsForResult = 0
        // for (let i = 0; i < this.input.length; i++) {
        //     const ref = { 
        //         counterSteps: this.counterStepsForResult,
        //         curPosition: this.curPosition, 
        //         historiStep: this.historiRun,
        //     }

        //     const after = this._step(ref, histUnit)
        //     this.counterStepsForResult = ref.counterSteps
        //     this.curPosition = ref.curPosition
        //     this.historiRun = ref.historiStep
        //     this.treeHist = after.tree ? after.tree: []
        // }

        const ref = { 
            counterSteps: this.counterStepsForResult,
            curPosition: this.curPosition, 
            historiStep: this.historiRun,
        }

        const after = this._step(ref, histUnit)
        this.counterStepsForResult = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiRun = ref.historiStep
        this.treeHist = after.tree ? after.tree: []
        
        //while ((after.history.length !== 0) && (after.nodes.length !== 0)) {
        for (let i = 0; i < 4; i++){
            const ref = { 
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition, 
                historiStep: this.historiRun,
            }
    
            const after = this._step(ref, histUnit)
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            this.treeHist = after.tree ? after.tree: []
        }




        console.log(this.treeHist)
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

    protected checkTransition = (setNodes: Set<NodeCore>, letterId: number): boolean => {
        let answer = true;
        setNodes.forEach(setNode => {
            //console.log(`setNode.id = ${setNode.id}`)
            if (this.isTransitionActive(setNode, letterId) === false){
                answer = false
                //console.log(`checkTrans set node id ${setNode.id}`)
            }
        })
        //console.log(`answer = ${answer}`)
       return answer;
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

    protected getLetterByNum = (num: number): string => {
        let k: string = '';
        this.alphabet.forEach((value, key) => {
            if (value === num){
                k = key;
            }
        });
        return k;
    }

    // protected cons = (): void => {
    //     this.getStatementsFromNodes(this.nodes);
    // }

    protected getStatementsFromNodes(nodes: NodeCore[]): void {
        for (let i = 0; i < nodes.length; i++) {
            this.statements.set(
                nodes[i].id,
                {
                    id: nodes[i].id,
                    isAdmit: nodes[i].isAdmit,
                    idLogic: i,
                    output: nodes[i].output
                })
        }
    }

    protected findNodeByLetter = (letterId: number): Set<statementCell> => {
        let nodesId = new Set<number>()
        let setOfNodes = new Set<statementCell>()
        this.edges.forEach(edge => edge.transitions.forEach(tr => 
            tr.forEach(way => {
                //console.log(`way.title = ${way.title}`)
                //console.log(``)
                if ((way.title === this.getLetterByNum(letterId)) && !(nodesId.has(edge.from)))
                    nodesId.add(edge.from)
            })))
        
        
        //return setOfNodes
        nodesId.forEach(nodId => 
            this.matrix.forEach(i => i.forEach(j => j.forEach(stCell => {
            if ((stCell.id === nodId) && (!setOfNodes.has(stCell)))
                setOfNodes.add(stCell)
        }))))
        return setOfNodes
    }

    protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }, histUnit: HistUnit[]): Step => {

        const nodesOfCurPos: NodeCore[] = [];
        const byLetter: NodeCore[] = [];
        let minusFirstSave = new Set<returnTokensId>();
        let plusFirstSave = new Set<returnTokensId>();
        let isCounterStepsActive = 0;
        let cou = 0;
        for (let i = 0; i < this.alphabet.size; i++){
            console.log(`START STEP`)
            let nodeByLetter = this.getNodeByLetterId(i);
            console.log('this.checkTransition(nodeByLetter, i)')
            console.log(this.checkTransition(nodeByLetter, i))
            if (this.checkTransition(nodeByLetter, i) === false){
                continue  
            }
            let posMatrix: position[] = [];
            //let find = this.findNodeByLetter(i);
            //find.forEach(f => console.log(f.from))
            nodeByLetter.forEach(nod => {
                let ps = this.toPosition(nod, i);
                console.log(this.nodes[nod.from?.id!])
                posMatrix.push(ps);
            })
            ref.curPosition = posMatrix;
            let trNum = this.getLetterByNum(i)
            //ref.historiStep.push({nodes: this.getNode(ref.curPosition), by: trNum })
            
            ref.curPosition.forEach(d => console.log(d))
            if (!(ref.curPosition === undefined)) {
                //cou++
                //console.log(cou)
                isCounterStepsActive++;
                console.log(`INDEX COUNTERSTEPS`); 
                console.log(isCounterStepsActive);
                const nextPositions = this.nextStepPositions(ref.curPosition, i)
                nextPositions.forEach(nextPos =>  console.log(`next step pos-s ${nextPos}`))
                ref.curPosition = nextPositions;
                let ret = this.changeCountTokens(ref.curPosition);
                const nodesOfCurPos = this.toNodes(ref.curPosition)
                //nodesOfCurPos.forEach((node) => byLetter.push(node))
                //this.nodes = ret;
                let minus = ret['minusId'];
                let plus = ret['plusId'];
                // minusFirstSave = minus;
                // plusFirstSave = plus;
                let count = 0;
                minus.forEach(m => {
                    console.log(m.nodeId, m.countTokens)
                    if (this.nodes[m.nodeId].countTokens !== undefined){
                        this.nodes[m.nodeId].countTokens! += m.countTokens;
                    }
                })
                plus.forEach(p => {
                    console.log(p.nodeId, p.countTokens)
                    if (this.nodes[p.nodeId].countTokens !== undefined){
                        this.nodes[p.nodeId].countTokens! -= p.countTokens;
                    }
                })
                let nodeByLet = Array.from(nodeByLetter);
                histUnit.push({by: this.getLetterByNum(i), from: nodeByLet, value: nodesOfCurPos})
                console.log(histUnit)
                if (isCounterStepsActive === 1) {
                    minusFirstSave = minus;
                    plusFirstSave = plus;
                    ref.historiStep.push({nodes: this.getNode(ref.curPosition), by: trNum })
                    nodesOfCurPos.forEach((node) => byLetter.push(node));
                }
                //this.treeHist.push(histUnit)
            }
            // else {
            //     console.log(`IF НЕ РАБОТАЕТ`)
            // }
            
        }
        console.log(ref.historiStep);

        if (isCounterStepsActive > 0) {
            ref.counterSteps++;
            minusFirstSave.forEach(m => {
                console.log(m.nodeId, m.countTokens)
                if (this.nodes[m.nodeId].countTokens !== undefined){
                    this.nodes[m.nodeId].countTokens! -= m.countTokens;
                }
            })
            plusFirstSave.forEach(p => {
                console.log(p.nodeId, p.countTokens)
                if (this.nodes[p.nodeId].countTokens !== undefined){
                    this.nodes[p.nodeId].countTokens! += p.countTokens;
                }
            })
        }
        
        return {
            counter: ref.counterSteps,
            history: ref.historiStep, 
            nodes: nodesOfCurPos, 
            isAdmit: this.haveAdmitting(this.curPosition),
            tree: this.treeHist,
            byLetter, 
        }
    }

    public restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.treeHist = []
        // this.startStatements.forEach(value => {
        //     this.curPosition.push({
        //         stmt: this.statements.get(value.id),
        //     })
        // })
    }

    step = this.pnStep;
    run = this.pnRun;

}

// let petri = new PetriNets({
//     nodes: [
//         { id: 0, isAdmit: false, countTokens: 1 }, 
//         { id: 1, isAdmit: false, countTokens: 1 }, 
//         { id: 2, isAdmit: false, countTokens: 0 },
//     ],
//     edges: [
//         { from: 0, to: 2, transitions: new Set([[{title: 'a', countArcs: { InputArcs: 1, OutputArcs: 2 }}]]) }, 
//         { from: 1, to: 2, transitions: new Set([[{title: 'a', countArcs: { InputArcs: 1, OutputArcs: 1 }}]]) },
//     ]
// }, [{id: 0, isAdmit: false }, { id: 1, isAdmit: false }])

// //let st = petri.step();
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// //console.log(petri.run());



// let petri = new PetriNets({

//         nodes: [
//             { id: 0, isAdmit: false, countTokens: 1 }, 
//             { id: 1, isAdmit: false, countTokens: 0 },
//             { id: 2, isAdmit: false, countTokens: 0 }, 
//             { id: 3, isAdmit: false, countTokens: 2 },
//             { id: 4, isAdmit: false, countTokens: 1 },
//         ],
//         edges: [
//             { from: 0, to: 1, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//             { from: 0, to: 2, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) }, 
//             { from: 0, to: 3, transitions: new Set([[{ title: 'a', countArcs: {InputArcs: 1, OutputArcs: 2} }]]) }, 
//             { from: 1, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//             { from: 2, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) }, 
//             { from: 3, to: 1, transitions: new Set([[{ title: 'b', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//             { from: 3, to: 4, transitions: new Set([[{ title: 'c', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//             { from: 4, to: 2, transitions: new Set([[{ title: 'd', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//             { from: 4, to: 3, transitions: new Set([[{ title: 'd', countArcs: {InputArcs: 1, OutputArcs: 1} }]]) },
//         ]
//     },  [{ id: 0, isAdmit: false }])
// //console.log(`It's petri run \n ${petri.run()}`)
// //console.log(`It's petri step \n ${petri.step()}`)
// console.log(petri.run());
// // console.log(petri.step());
// // console.log(petri.step());
// // console.log(petri.step());
// // console.log(petri.step());
// // console.log(petri.step());
// // console.log(petri.step());



