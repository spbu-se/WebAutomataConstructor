import { History, position, Step } from "./Types";
//import { HistTrace } from "./Types";
//export{};
import { GraphCore, NodeCore, EdgeCore } from "./IGraphTypes";
import { Computer, EPS, statementCell } from "./Computer";

console.log("tevirp");
// export class PetriNets extends Computer { 

//     protected curPosition: position[];

//     private isTransitionActive(isActiveNode: NodeCore): boolean {
//         let curNumberOfArcs: number = 0;
//         let way = this.alphabet.get(this.input[this.counterSteps]?.value);
//         this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(tr => {
//             if (tr.title === way) {
//                 curNumberOfArcs = tr.numberOfArcs!;
//         }})))
//         if (isActiveNode.countTokens! >= curNumberOfArcs) {
//             return true;
//         }
//         return false;
//     }

    

//     constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
//         super(graph, startStatements)
//         this.curPosition = []
//         startStatements.forEach(value => {
//             this.curPosition.push({
//                 stmt: this.statements.get(value.id),
//             })
//         })
//         this.nodes = graph.nodes;
//         this.setInput(input);
//     }

//     private changecountTokens(nodesForChange: NodeCore[]): void {
        
//         nodesForChange.forEach(nodeForChange => {
//             this.edges.forEach(edge => {
//                 if (edge.from === nodeForChange.id) {
//                     this.minusToken(nodeForChange)
//                 }
//                 if (edge.to === nodeForChange.id) {
//                     this.plusToken(nodeForChange)
//                 }
//             })   
//         })
//         this.nodes.forEach(node => node.isChangedTokens = false)
//     }


//     private minusToken(value: NodeCore): void {
//         if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
//             value.countTokens--;
//             value.isChangedTokens = true;
//         }
//     }

//     private plusToken(value: NodeCore): void {
//         if ((value.countTokens !== undefined) && (!value.isChangedTokens)) {
//             value.countTokens++;
//             value.isChangedTokens = true;
//         }
//     }

//     protected givesEdgeByType = (from: number): EdgeCore => {
//         let result: EdgeCore;
//         result = this.edges[0];
//         this.edges.forEach(edge => edge.transitions.forEach(transition => transition.forEach(way => {
//             if (way.title === this.alphabet.get(this.input[this.counterSteps]?.value) &&  edge.from === from) {
//                 result = edge;
//                 return result;
//             }
//         }))) 
//         return result;
//     }

//     public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

//     protected toNodes = (positions: position[]): NodeCore[] => {
    
//         let edgesMap: EdgeCore[] = [];
        
//         positions.forEach(position => {
//             if (this.isTransitionActive(position.cur!)) {
//             this.edges.forEach(edge => {
//                 let needEdge = this.givesEdgeByType(edge.from)
//                 edgesMap.push(needEdge);
//             })
//         }})

//         let toNodes: NodeCore[] = [];
//         edgesMap.forEach(edge => this.nodes.forEach(node => {
//             if (node.id === edge.to) {
//                 toNodes.push(node);
//             }
//         }))  
//         return toNodes;      
//     }

//     /*Нужно написать функцию которая будет находить все активные переходы. (У Андрея функция находит следующий шаг 
//     а потом как-то находятся ) У меня функция находит все множества переходов и 
//     собирает из них таблицу
//     */

//     protected nextStepPosition = (position: position, by: number): position[] => {
//         return this.cellMatrix(position.stmt.idLogic, by).map(v => {
//             const getLetter = (id: number): any => {
//                 let ret
//                 this.alphabet.forEach((v, k) => {
//                     if (id === v) {
//                         ret = k
//                     }
//                 })
//                 return ret
//             }
    
//             const ret: position = { 
//                 stmt: v, 
//                 by: getLetter(by), 
//                 cur: this.nodes[v.idLogic], 
//                 from: this.nodes[position.stmt.idLogic]
//             }
//             return ret
//         })
//     }

//     public setInput = (input: string[]) => {
//         this.input = []
//         input.forEach(value => {
//             this.input.push({ idLogic: this.alphabet.get(value), value: value })
//         })
//         this.restart()
//     }
    
//     protected nextStepPositions = (positions: position[], by: number): position[] => {
//         let acc: position[] = []
//         positions.map((v) =>
//             this.nextStepPosition(v, by)).forEach((ps) =>
//                 ps.forEach((p) => acc.push(p)))
//         return acc
//     }
    
//     pnStep = (): Step => {
//         let curPositionMatrix: NodeCore[] = [];
//         const ref = { 
//             counterSteps: this.counterSteps,
//             curPosition: this.curPosition, 
//             historiStep: this.historiStep 
//         }
//         const after = this._step(ref, [])
//         this.counterSteps = ref.counterSteps
//         this.curPosition = ref.curPosition
//         this.historiStep = ref.historiStep
//         this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
//         this.changecountTokens(curPositionMatrix);
        

//         return {
//             counter: after.counter,
//             history: after.history,
//             isAdmit: after.isAdmit,
//             nodes: after.nodes,
//             output: after.output,
//             byLetter: after.byLetter
//         }
//     }
    
//     pnRun = (): Step => {
//         const histTrace: HistTrace[] = []
        
//         this.historiRun = []
//         this.counterStepsForResult = 0
//         let curPositionMatrix: NodeCore[] = [];

//         for (let i = 0; i < this.input.length; i++) {
//             const ref = { 
//                 counterSteps: this.counterStepsForResult,
//                 curPosition: this.curPosition, 
//                 historiStep: this.historiRun 
//             }
//             const after = this._step(ref, histTrace)
//             this.counterStepsForResult = ref.counterSteps
//             console.log(this.counterStepsForResult)
//             this.curPosition = ref.curPosition
//             this.historiRun = ref.historiStep
//             this.curPosition.forEach(curPos => curPositionMatrix.push(curPos.cur!));
//             this.changecountTokens(curPositionMatrix);
        
//         }
        
//         return { 
//             counter: this.counterStepsForResult, 
//             history: this.historiRun, 
//             isAdmit: this.haveAdmitting(this.curPosition), 
//             nodes: this.toNodes(this.curPosition),
//             histTrace
//         }
//     }


//     protected haveAdmitting(positions: position[]): boolean {
//         return positions.reduce((acc: boolean, p) => acc && p.stmt.isAdmit, true)
//     }


//     protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }, histTrace: HistTrace[]): Step => {
//         const byLetter: NodeCore[] = [];
//         const trNum = this.alphabet.get(this.input[ref.counterSteps]?.value)
//         const nextPositions = this.nextStepPositions(ref.curPosition, trNum)

//         ref.curPosition = nextPositions;

//         const nodesOfCurPos = this.toNodes(ref.curPosition)
//         nodesOfCurPos.forEach((node) => byLetter.push(node))

//         ref.historiStep.push({nodes: nodesOfCurPos, by: trNum })
//         if (ref.curPosition.length > 0) {
//             ref.counterSteps++
//         }

//         histTrace.push({ byLetter })

//         return {
//             counter: ref.counterSteps,
//             history: ref.historiStep, 
//             nodes: nodesOfCurPos, 
//             isAdmit: this.haveAdmitting(this.curPosition),
//             byLetter, 
//             histTrace
//         }
//     }

//     public restart = () => {
//         this.counterSteps = 0
//         this.historiStep = []
//         this.curPosition = []
//         this.startStatements.forEach(value => {
//             this.curPosition.push({
//                 stmt: this.statements.get(value.id),
//             })
//         })
//     }

//     step = this.pnStep;
//     run = this.pnRun;

// }