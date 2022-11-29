import { History, position, Step, HistTrace, HistUnit, ConfigurationHistUnit } from "./Types";
import { GraphCore, NodeCore, CountArcs, EdgeCore } from "./IGraphTypes";
import { Computer, EPS, statementCell } from "./Computer";
import { config } from "process";


export type returnTokensId = {
    nodeId: number,
    countTokens: number,
}

 export class PetriNets extends Computer { 

    protected curPosition: position[];

    constructor(graph: GraphCore, startStatements: NodeCore[], input: string[]) {
        super(graph, startStatements)
        this.curPosition = []
        this.startStatements = this.nodes
        startStatements.forEach(value => {
            this.curPosition.push({
                stmt: this.statements.get(value.id),
            })
        })
        this.setInput(input)
        this.treeHist = []
        this.configTreeHist = []
        this.counterSteps = 0;
    }

    protected treeHist: HistUnit[][] = []
    protected configTreeHist: ConfigurationHistUnit[][] = []

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
        let minusId = new Set<returnTokensId>();
        let plusId = new Set<returnTokensId>();

        setPosition.forEach(pos => {
            const countArcs = this.giveNumberArcs(pos);

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
        let countPlusTokens = 0;
        if ((value.countTokens !== undefined)) {
            value.countTokens += countArcs.OutputArcs;
            countPlusTokens += countArcs.OutputArcs;
        }
        return countPlusTokens;
    }

    public haveEpsilon = () => this.alphabet.get(EPS) !== undefined;

    protected nextStepPosition = (position: position, by: number): position[] => {
        return this.cellMatrix(position.stmt.idLogic, by).map(v => {
            const ret: position = { 
                stmt: v, 
                by: this.getLetterByNum(by), 
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

    public getMarking = () => {
        return this.nodes.map(node => node.countTokens)
    }

    pnStep = (): Step => {
        const ref = { 
            counterSteps: this.counterSteps,
            curPosition: this.curPosition, 
            historiStep: this.historiStep,
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
            configTree: after.configTree,
            byLetter: after.byLetter
        }
    }
    
    pnRun = (): Step => {
        this.historiRun = []
        this.counterStepsForResult = 0

        const ref = {
            counterSteps: this.counterStepsForResult,
            curPosition: this.curPosition,
            historiStep: this.historiRun,
        }

        const after = this._step(ref)
        this.counterStepsForResult = ref.counterSteps
        this.curPosition = ref.curPosition
        this.historiRun = ref.historiStep

        for (let i = 0; i < 50; i++){
            const ref = {
                counterSteps: this.counterStepsForResult,
                curPosition: this.curPosition,
                historiStep: this.historiRun,
            }

            const after = this._step(ref)
            this.counterStepsForResult = ref.counterSteps
            this.curPosition = ref.curPosition
            this.historiRun = ref.historiStep
            this.treeHist = after.tree ? after.tree: []
        }

        return {
            counter: this.counterStepsForResult,
            history: this.historiRun,
            isAdmit: this.haveAdmitting(this.curPosition),
            nodes: this.toNodes(this.curPosition),
            configTree: after.configTree,
            byLetter: after.byLetter
        }
    }

    protected haveAdmitting(positions: position[]): boolean {
        return positions.reduce((acc: boolean, p) => acc && p.stmt.isAdmit, true)
    }

    protected checkTransition = (setNodes: Set<NodeCore>, letterId: number): boolean => {
        let answer = true;
        setNodes.forEach(setNode => {
            if (this.isTransitionActive(setNode, letterId) === false){
                answer = false
            }
        })
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
                countTokens: value.stmt.countTokens
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
                if ((way.title === this.getLetterByNum(letterId)) && !(nodesId.has(edge.from)))
                    nodesId.add(edge.from)
            })))
      
        nodesId.forEach(nodId => 
            this.matrix.forEach(i => i.forEach(j => j.forEach(stCell => {
            if ((stCell.id === nodId) && (!setOfNodes.has(stCell)))
                setOfNodes.add(stCell)
        }))))
        return setOfNodes
    }

    protected changeBackPLus = (tokensPutBack: Set<returnTokensId>): void => {
        tokensPutBack.forEach(tokens => {
            if (this.nodes[tokens.nodeId].countTokens !== undefined){
                this.nodes[tokens.nodeId].countTokens! += tokens.countTokens;
            }
        })
    }

    protected changeBackMinus = (tokensPutBack: Set<returnTokensId>): void => {
        tokensPutBack.forEach(tokens => {
            if (this.nodes[tokens.nodeId].countTokens !== undefined){
                this.nodes[tokens.nodeId].countTokens! -= tokens.countTokens;
            }
        })
    }

    protected _step = (ref: {counterSteps: number, curPosition: position[], historiStep: History[] }): Step => {
        let nodesOfCurPos: NodeCore[] = [];
        const byLetter: NodeCore[] = [];
        let minusFirstSave = new Set<returnTokensId>();
        let plusFirstSave = new Set<returnTokensId>();
        let isCounterStepsActive = 0;
        const histUnit = []
        this.configTreeHist.push([])

        for (let i = 0; i < this.alphabet.size; i++){
            let nodeByLetter = this.getNodeByLetterId(i);
            if (this.checkTransition(nodeByLetter, i) === false){
                continue  
            }
            let posMatrix: position[] = [];
            nodeByLetter.forEach(nod => {
                let ps = this.toPosition(nod, i);
                posMatrix.push(ps);
            })
            ref.curPosition = posMatrix;
            let trNum = this.getLetterByNum(i)
            
            ref.curPosition.forEach(d => console.log(d))
            if (!(ref.curPosition === undefined)) {
                isCounterStepsActive++;
                const nextPositions = this.nextStepPositions(ref.curPosition, i)
                ref.curPosition = nextPositions;
                const from_tokens = this.nodes.map(node => node.countTokens!)
                const ret = this.changeCountTokens(ref.curPosition); 
                nodesOfCurPos = this.toNodes(ref.curPosition)
                let minus = ret['minusId'];
                let plus = ret['plusId'];
                const value_tokens = this.nodes.map(node => node.countTokens!)
                // change back
                this.changeBackPLus(minus);
                this.changeBackMinus(plus);
                const nodeByLet = Array.from(nodeByLetter);

                const configHistoryStep = <ConfigurationHistUnit>{
                    by: this.getLetterByNum(i),
                    from: from_tokens,
                    value: value_tokens
                }
                this.configTreeHist[ref.counterSteps].push(configHistoryStep)
                histUnit.push({by: this.getLetterByNum(i), from: nodeByLet, value: nodesOfCurPos})
                
                if (isCounterStepsActive === 1) {
                    minusFirstSave = minus;
                    plusFirstSave = plus;
                    ref.historiStep.push({nodes: this.getNode(ref.curPosition), by: trNum })
                    nodesOfCurPos.forEach((node) => byLetter.push(node));
                }
                this.treeHist.push(histUnit)
            }
        }
        const nodesCur: NodeCore[] = [];
        if (isCounterStepsActive > 0) {
            ref.counterSteps++;
            this.changeBackMinus(minusFirstSave);
            this.changeBackPLus(plusFirstSave);
            byLetter.forEach(byL => nodesCur.push(byL))
        }
        
        return {
            counter: ref.counterSteps,
            history: ref.historiStep, 
            nodes: nodesCur, 
            isAdmit: this.haveAdmitting(this.curPosition),
            tree: this.treeHist,
            configTree: this.configTreeHist,
            byLetter, 
        }
    }

    public restart = () => {
        this.counterSteps = 0
        this.historiStep = []
        this.curPosition = []
        this.treeHist = []
        this.configTreeHist = []
        this.startStatements = this.nodes
    }

    step = this.pnStep;
    run = this.pnRun;

}

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


